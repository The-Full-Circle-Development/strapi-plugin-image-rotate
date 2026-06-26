/**
 * A file value is a rotatable image when it is a populated media object with a
 * raster image mime (SVG/GIF excluded) and a numeric/string id + url.
 */
export const isRotatableImage = (file) =>
  !!file &&
  typeof file === 'object' &&
  typeof file.mime === 'string' &&
  file.mime.startsWith('image/') &&
  file.mime !== 'image/svg+xml' &&
  file.mime !== 'image/gif' &&
  (typeof file.id === 'number' || typeof file.id === 'string') &&
  !!file.url;

/**
 * Walk a Content Manager `document` and collect every rotatable image found in
 * any media field (single or multiple). Schema-free: we detect images purely by
 * value shape, so it works regardless of the content-type's field names.
 *
 * Returns a de-duplicated list of { field, file }.
 */
export const collectImageFiles = (document) => {
  const out = [];
  const seen = new Set();

  if (!document || typeof document !== 'object') return out;

  for (const [field, value] of Object.entries(document)) {
    if (!value) continue;
    const items = Array.isArray(value) ? value : [value];
    for (const item of items) {
      if (isRotatableImage(item) && !seen.has(item.id)) {
        seen.add(item.id);
        out.push({ field, file: item });
      }
    }
  }

  return out;
};

/**
 * Append a cache-busting query param so the browser re-fetches an image whose
 * URL is unchanged but whose bytes have changed.
 */
export const bustCache = (url, stamp) => {
  if (!url) return url;
  if (!stamp) return url;
  return `${url}${url.includes('?') ? '&' : '?'}v=${stamp}`;
};
