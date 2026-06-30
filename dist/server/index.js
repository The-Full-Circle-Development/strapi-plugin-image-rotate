"use strict";
Object.defineProperties(exports, { __esModule: { value: true }, [Symbol.toStringTag]: { value: "Module" } });
const fs = require("fs");
const os = require("os");
const path = require("path");
const stream = require("stream");
const sharp = require("sharp");
const _interopDefault = (e) => e && e.__esModule ? e : { default: e };
const fs__default = /* @__PURE__ */ _interopDefault(fs);
const os__default = /* @__PURE__ */ _interopDefault(os);
const path__default = /* @__PURE__ */ _interopDefault(path);
const sharp__default = /* @__PURE__ */ _interopDefault(sharp);
const register = ({ strapi }) => {
};
const bootstrap = ({ strapi }) => {
  if (!strapi.plugin("upload")?.provider) {
    strapi.log.warn(
      "[image-rotate] The upload plugin provider could not be resolved. Image rotation will fail until the Media Library / upload provider is configured."
    );
  }
};
const config = {
  default: {},
  validator() {
  }
};
const PLUGIN_ID = "image-rotate";
const rotate$1 = ({ strapi }) => ({
  /**
   * POST /image-rotate/rotate/:id
   * Body: { degrees?: number }  // multiple of 90, clockwise. Defaults to 90.
   */
  async rotate(ctx) {
    const { id } = ctx.params;
    const numericId = Number(id);
    if (!Number.isInteger(numericId) || numericId <= 0) {
      return ctx.badRequest("A valid numeric file `id` is required.");
    }
    const body = ctx.request.body ?? {};
    const degrees = body.degrees === void 0 ? 90 : Number(body.degrees);
    if (!Number.isFinite(degrees) || degrees % 90 !== 0) {
      return ctx.badRequest("`degrees` must be a multiple of 90 (e.g. 90, -90, 180, 270).");
    }
    try {
      const file = await strapi.plugin(PLUGIN_ID).service("rotate").rotate(numericId, degrees);
      ctx.body = file;
    } catch (err) {
      if (err && err.status) {
        return ctx.throw(err.status, err.message);
      }
      strapi.log.error(`[image-rotate] Unexpected error rotating file ${numericId}: ${err.stack || err.message}`);
      return ctx.throw(500, "Failed to rotate the image.");
    }
  }
});
const controllers = {
  rotate: rotate$1
};
const routes = {
  admin: {
    type: "admin",
    routes: [
      {
        method: "POST",
        path: "/rotate/:id",
        handler: "rotate.rotate",
        config: {
          policies: [
            "admin::isAuthenticatedAdmin",
            {
              name: "admin::hasPermissions",
              config: { actions: ["plugin::upload.assets.update"] }
            }
          ]
        }
      }
    ]
  }
};
const FILE_MODEL_UID = "plugin::upload.file";
class RotateError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = "RotateError";
    this.status = status;
  }
}
const ROTATABLE_MIME = /* @__PURE__ */ new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/tiff",
  "image/avif",
  "image/heif",
  "image/heic"
]);
const bytesToKbytes = (bytes) => Math.round(bytes / 1e3 * 100) / 100;
const normaliseDegrees = (degrees) => {
  const n = Number(degrees);
  if (!Number.isFinite(n) || n % 90 !== 0) {
    throw new RotateError("`degrees` must be a multiple of 90 (e.g. 90, -90, 180, 270).", 400);
  }
  return (Math.round(n / 90) * 90 % 360 + 360) % 360;
};
const rotate = ({ strapi }) => ({
  /**
   * Whether a given mime type can be rotated.
   */
  isRotatableMime(mime) {
    if (typeof mime !== "string") return false;
    const m = mime.toLowerCase();
    if (m === "image/svg+xml" || m === "image/gif") return false;
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
    const publicDir = strapi.dirs && strapi.dirs.static && strapi.dirs.static.public || path__default.default.join(strapi.dirs?.app?.root || process.cwd(), "public");
    const filePath = path__default.default.join(publicDir, file.url.replace(/^\/+/, ""));
    return fs__default.default.promises.readFile(filePath);
  },
  /**
   * Rotate a raw image buffer by `degrees` (clockwise) and re-encode to the
   * same format as the input. EXIF orientation is baked in first (so phone
   * photos don't double-rotate) and then stripped (sharp's default), which
   * prevents browsers from applying orientation a second time.
   */
  async rotateBuffer(buffer, degrees) {
    const baseMeta = await sharp__default.default(buffer).metadata();
    let working = buffer;
    if (baseMeta.orientation && baseMeta.orientation !== 1) {
      working = await sharp__default.default(buffer, { failOn: "none" }).rotate().toBuffer();
    }
    const meta = await sharp__default.default(working).metadata();
    let pipeline = sharp__default.default(working, { failOn: "none" }).rotate(degrees);
    switch (meta.format) {
      case "jpeg":
        pipeline = pipeline.jpeg({ quality: 90, mozjpeg: true });
        break;
      case "png":
        pipeline = pipeline.png({ compressionLevel: 9, adaptiveFiltering: true });
        break;
      case "webp":
        pipeline = pipeline.webp({ quality: 90 });
        break;
      case "tiff":
        pipeline = pipeline.tiff();
        break;
      case "avif":
        pipeline = pipeline.avif({ quality: 60 });
        break;
      case "heif":
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
    const uploadConfig = strapi.config.get("plugin::upload");
    if (dbFile.provider !== uploadConfig.provider) {
      throw new RotateError(
        `This file was uploaded with the "${dbFile.provider}" provider but the active provider is "${uploadConfig.provider}". In-place rotation is only supported on the active provider.`,
        422
      );
    }
    if (deg === 0) {
      return dbFile;
    }
    const imageManipulation = strapi.plugin("upload").service("image-manipulation");
    const providerService = strapi.plugin("upload").service("provider");
    const rawProvider = strapi.plugin("upload").provider;
    const originalBuffer = await this.getOriginalBuffer(dbFile);
    const rotatedBuffer = await this.rotateBuffer(originalBuffer, deg);
    const tmpWorkingDirectory = await fs__default.default.promises.mkdtemp(
      path__default.default.join(os__default.default.tmpdir(), "strapi-image-rotate-")
    );
    try {
      const fileData = {
        id: dbFile.id,
        name: dbFile.name,
        alternativeText: dbFile.alternativeText,
        caption: dbFile.caption,
        hash: dbFile.hash,
        // <-- keep identical
        ext: dbFile.ext,
        //  <-- keep identical
        mime: dbFile.mime,
        path: dbFile.path ?? null,
        folderPath: dbFile.folderPath,
        provider: dbFile.provider,
        provider_metadata: dbFile.provider_metadata,
        tmpWorkingDirectory,
        // A fresh stream every call (image-manipulation + provider read it multiple times).
        getStream: () => stream.Readable.from(rotatedBuffer),
        size: bytesToKbytes(rotatedBuffer.length),
        sizeInBytes: rotatedBuffer.length,
        formats: {}
      };
      const { width, height } = await imageManipulation.getDimensions(fileData);
      fileData.width = width;
      fileData.height = height;
      const newFormatKeys = /* @__PURE__ */ new Set();
      if (await imageManipulation.isResizableImage(fileData)) {
        const thumbnailFile = await imageManipulation.generateThumbnail(fileData);
        if (thumbnailFile) {
          await providerService.upload(thumbnailFile);
          newFormatKeys.add("thumbnail");
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
      await providerService.upload(fileData);
      if (dbFile.formats && typeof dbFile.formats === "object") {
        await Promise.all(
          Object.keys(dbFile.formats).filter((key) => !newFormatKeys.has(key)).map(
            (key) => rawProvider.delete(dbFile.formats[key]).catch((err) => {
              strapi.log.warn(
                `[image-rotate] Failed to delete orphaned format "${key}" of file ${id}: ${err.message}`
              );
            })
          )
        );
      }
      const updated = await strapi.db.query(FILE_MODEL_UID).update({
        where: { id },
        data: {
          width: fileData.width,
          height: fileData.height,
          size: fileData.size,
          formats: fileData.formats,
          url: fileData.url || dbFile.url,
          provider_metadata: fileData.provider_metadata,
          updatedAt: new Date()
        }
      });
      try {
        strapi.eventHub?.emit?.("media.update", { media: updated });
      } catch (err) {
        strapi.log.debug(`[image-rotate] media.update event emit skipped: ${err.message}`);
      }
      strapi.log.info(
        `[image-rotate] Rotated file ${id} ("${dbFile.name}") by ${deg}° -> ${fileData.width}x${fileData.height}.`
      );
      return updated;
    } finally {
      await fs__default.default.promises.rm(tmpWorkingDirectory, { recursive: true, force: true }).catch(() => {
      });
    }
  }
});
const services = {
  rotate
};
const index = {
  register,
  bootstrap,
  config,
  controllers,
  routes,
  services
};
exports.default = index;
