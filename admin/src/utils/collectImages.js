/**
 * Append a cache-busting query param so the browser re-fetches an image whose
 * URL is unchanged but whose bytes have changed (e.g. after an in-place rotate).
 */
export const bustCache = (url, stamp) => {
  if (!url) return url;
  if (!stamp) return url;
  return `${url}${url.includes('?') ? '&' : '?'}v=${stamp}`;
};
