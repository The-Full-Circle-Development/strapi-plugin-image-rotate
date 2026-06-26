import fs from 'fs';
import os from 'os';
import path from 'path';
import { Readable } from 'stream';

import sharp from 'sharp';

const FILE_MODEL_UID = 'plugin::upload.file';

/**
 * A typed error carrying an HTTP status. Kept dependency-free (no `@strapi/utils`)
 * so the plugin resolves cleanly under strict package managers (pnpm) where core
 * sub-dependencies aren't hoisted. The controller maps `.status` to the response.
 */
class RotateError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = 'RotateError';
    this.status = status;
  }
}

/**
 * Mime types we can safely, losslessly rotate with sharp.
 * SVG (vector) and GIF (animated frames) are intentionally excluded.
 */
const ROTATABLE_MIME = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/tiff',
  'image/avif',
  'image/heif',
  'image/heic',
]);

/** Strapi persists file size in kilobytes (decimal). */
const bytesToKbytes = (bytes) => Math.round((bytes / 1000) * 100) / 100;

/** Normalise an arbitrary degree value to one of 0 / 90 / 180 / 270 (clockwise). */
const normaliseDegrees = (degrees) => {
  const n = Number(degrees);
  if (!Number.isFinite(n) || n % 90 !== 0) {
    throw new RotateError('`degrees` must be a multiple of 90 (e.g. 90, -90, 180, 270).', 400);
  }
  return ((Math.round(n / 90) * 90) % 360 + 360) % 360;
};

export default ({ strapi }) => ({
  /**
   * Whether a given mime type can be rotated.
   */
  isRotatableMime(mime) {
    if (typeof mime !== 'string') return false;
    const m = mime.toLowerCase();
    if (m === 'image/svg+xml' || m === 'image/gif') return false;
    return ROTATABLE_MIME.has(m);
  },

  /**
   * Read the original bytes of a stored file in a provider-agnostic way.
   * - Cloud providers (S3 / Cloudinary): the url is absolute -> fetch it.
   * - Local provider: the url is relative ('/uploads/..') -> read from disk.
   */
  async getOriginalBuffer(file) {
    if (/^https?:\/\//i.test(file.url)) {
      const res = await fetch(file.url);
      if (!res.ok) {
        throw new RotateError(
          `Could not download the original file (HTTP ${res.status}) from ${file.url}.`,
          502
        );
      }
      return Buffer.from(await res.arrayBuffer());
    }

    const publicDir =
      (strapi.dirs && strapi.dirs.static && strapi.dirs.static.public) ||
      path.join(strapi.dirs?.app?.root || process.cwd(), 'public');

    const filePath = path.join(publicDir, file.url.replace(/^\/+/, ''));
    return fs.promises.readFile(filePath);
  },

  /**
   * Rotate a raw image buffer by `degrees` (clockwise) and re-encode to the
   * same format as the input. EXIF orientation is baked in first (so phone
   * photos don't double-rotate) and then stripped (sharp's default), which
   * prevents browsers from applying orientation a second time.
   */
  async rotateBuffer(buffer, degrees) {
    // 1. Bake in EXIF orientation only when present (avoids a needless re-encode).
    const baseMeta = await sharp(buffer).metadata();
    let working = buffer;
    if (baseMeta.orientation && baseMeta.orientation !== 1) {
      working = await sharp(buffer, { failOn: 'none' }).rotate().toBuffer();
    }

    // 2. Detect format and rotate the now-upright pixels.
    const meta = await sharp(working).metadata();
    let pipeline = sharp(working, { failOn: 'none' }).rotate(degrees);

    switch (meta.format) {
      case 'jpeg':
        pipeline = pipeline.jpeg({ quality: 90, mozjpeg: true });
        break;
      case 'png':
        pipeline = pipeline.png({ compressionLevel: 9, adaptiveFiltering: true });
        break;
      case 'webp':
        pipeline = pipeline.webp({ quality: 90 });
        break;
      case 'tiff':
        pipeline = pipeline.tiff();
        break;
      case 'avif':
        pipeline = pipeline.avif({ quality: 60 });
        break;
      case 'heif':
        pipeline = pipeline.heif({ quality: 60 });
        break;
      default:
        throw new RotateError(`Unsupported image format for rotation: "${meta.format}".`, 415);
    }

    return pipeline.toBuffer();
  },

  /**
   * Rotate a Media Library image in place.
   *
   * Instead of Strapi's `replace` flow (delete-then-reupload, which is flaky on
   * caches / async thumbnails / cloud providers), this:
   *   1. fetches the current bytes,
   *   2. rotates them with sharp,
   *   3. OVERWRITES the same storage key (same hash + ext) via the active provider,
   *   4. regenerates the thumbnail + responsive formats,
   *   5. deletes any now-orphaned formats,
   *   6. updates the file record (width/height/size/formats/url).
   *
   * The public URL is preserved on local & S3 (Cloudinary changes its version
   * segment — see README), so existing references keep working.
   *
   * @param {number|string} id      Media file id.
   * @param {number}        degrees Multiple of 90, clockwise. Defaults to 90.
   * @returns the updated file record.
   */
  async rotate(id, degrees = 90) {
    const deg = normaliseDegrees(degrees);

    const dbFile = await strapi.db.query(FILE_MODEL_UID).findOne({ where: { id } });
    if (!dbFile) {
      throw new RotateError(`Media file with id "${id}" was not found.`, 404);
    }
    if (!this.isRotatableMime(dbFile.mime)) {
      throw new RotateError(
        `Cannot rotate a file of type "${dbFile.mime}". Only raster images (JPEG, PNG, WebP, TIFF, AVIF, HEIF) are supported — SVG and GIF are not.`,
        415
      );
    }

    const uploadConfig = strapi.config.get('plugin::upload');
    if (dbFile.provider !== uploadConfig.provider) {
      throw new RotateError(
        `This file was uploaded with the "${dbFile.provider}" provider but the active provider is "${uploadConfig.provider}". In-place rotation is only supported on the active provider.`,
        422
      );
    }

    // A 360°/0° rotation is a no-op.
    if (deg === 0) {
      return dbFile;
    }

    const imageManipulation = strapi.plugin('upload').service('image-manipulation');
    const providerService = strapi.plugin('upload').service('provider'); // handles stream/buffer + cleanup
    const rawProvider = strapi.plugin('upload').provider; // raw provider for deletes

    // Fetch + rotate.
    const originalBuffer = await this.getOriginalBuffer(dbFile);
    const rotatedBuffer = await this.rotateBuffer(originalBuffer, deg);

    // Temp working dir is required by image-manipulation to write regenerated formats.
    const tmpWorkingDirectory = await fs.promises.mkdtemp(
      path.join(os.tmpdir(), 'strapi-image-rotate-')
    );

    try {
      // Build an uploadable file that REUSES the existing hash + ext so the
      // provider overwrites the exact same storage key (URL stays stable).
      const fileData = {
        id: dbFile.id,
        name: dbFile.name,
        alternativeText: dbFile.alternativeText,
        caption: dbFile.caption,
        hash: dbFile.hash, // <-- keep identical
        ext: dbFile.ext, //  <-- keep identical
        mime: dbFile.mime,
        path: dbFile.path ?? null,
        folderPath: dbFile.folderPath,
        provider: dbFile.provider,
        provider_metadata: dbFile.provider_metadata,
        tmpWorkingDirectory,
        // A fresh stream every call (image-manipulation + provider read it multiple times).
        getStream: () => Readable.from(rotatedBuffer),
        size: bytesToKbytes(rotatedBuffer.length),
        sizeInBytes: rotatedBuffer.length,
        formats: {},
      };

      // Recompute dimensions from the rotated image (width/height swap on 90/270).
      const { width, height } = await imageManipulation.getDimensions(fileData);
      fileData.width = width;
      fileData.height = height;

      // Regenerate thumbnail + responsive formats from the rotated bytes.
      const newFormatKeys = new Set();
      if (await imageManipulation.isResizableImage(fileData)) {
        const thumbnailFile = await imageManipulation.generateThumbnail(fileData);
        if (thumbnailFile) {
          await providerService.upload(thumbnailFile);
          newFormatKeys.add('thumbnail');
          fileData.formats.thumbnail = thumbnailFile;
        }

        const responsiveFormats = await imageManipulation.generateResponsiveFormats(fileData);
        if (Array.isArray(responsiveFormats)) {
          for (const format of responsiveFormats) {
            if (!format || !format.file) continue;
            await providerService.upload(format.file);
            newFormatKeys.add(format.key);
            fileData.formats[format.key] = format.file;
          }
        }
      }

      // Overwrite the main asset in place (same hash + ext => same key/URL).
      await providerService.upload(fileData);

      // Delete formats that existed before but no longer apply (orphan cleanup).
      // Formats that still apply were already overwritten above (deterministic hashes).
      if (dbFile.formats && typeof dbFile.formats === 'object') {
        await Promise.all(
          Object.keys(dbFile.formats)
            .filter((key) => !newFormatKeys.has(key))
            .map((key) =>
              rawProvider.delete(dbFile.formats[key]).catch((err) => {
                strapi.log.warn(
                  `[image-rotate] Failed to delete orphaned format "${key}" of file ${id}: ${err.message}`
                );
              })
            )
        );
      }

      // Persist the new geometry/formats/url. hash & ext are unchanged on purpose.
      const updated = await strapi.db.query(FILE_MODEL_UID).update({
        where: { id },
        data: {
          width: fileData.width,
          height: fileData.height,
          size: fileData.size,
          formats: fileData.formats,
          url: fileData.url || dbFile.url,
          provider_metadata: fileData.provider_metadata,
        },
      });

      // Fire the media.update event so webhooks / listeners stay in sync (best effort).
      try {
        strapi.eventHub?.emit?.('media.update', { media: updated });
      } catch (err) {
        strapi.log.debug(`[image-rotate] media.update event emit skipped: ${err.message}`);
      }

      strapi.log.info(
        `[image-rotate] Rotated file ${id} ("${dbFile.name}") by ${deg}° -> ${fileData.width}x${fileData.height}.`
      );

      return updated;
    } finally {
      await fs.promises.rm(tmpWorkingDirectory, { recursive: true, force: true }).catch(() => {});
    }
  },
});
