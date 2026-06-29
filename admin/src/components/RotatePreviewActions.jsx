import { useRef } from 'react';

import { RotateActions } from './RotateActions';
import { bustCache } from '../utils/collectImages';

/**
 * Inline rotate controls (left / right 90°) for a single Media Library asset.
 *
 * Rendered inside @strapi/upload's `PreviewBox` action row — which is shared by
 * BOTH the standalone Media Library asset dialog AND the Content Manager
 * media-field asset dialog. Strapi 5's upload plugin exposes no admin injection
 * zone, so the plugin publishes this component on a global in `bootstrap()` and
 * a tiny patch to `@strapi/upload` renders it next to Crop (see cms `patches/`).
 *
 * @param {object} props
 * @param {{ id?: number, mime?: string, isLocal?: boolean, isUrlSigned?: boolean, hash?: string }} props.asset
 */
const RotatePreviewActions = ({ asset }) => {
  const ref = useRef(null);

  // Only persisted raster images: skip freshly-added local files (no id yet),
  // non-images, and the formats sharp can't losslessly rotate (SVG / GIF).
  if (!asset || !asset.id || asset.isLocal) return null;
  const mime = typeof asset.mime === 'string' ? asset.mime.toLowerCase() : '';
  if (!mime.startsWith('image/') || mime === 'image/svg+xml' || mime === 'image/gif') {
    return null;
  }

  // Rotation overwrites the asset in place (URL unchanged), so neither the dialog
  // nor the grid repaints on its own. Keep the dialog open and force just this
  // asset's <img> to re-fetch by cache-busting its src in place. We scope the
  // query to the surrounding dialog so we don't fight React reconciliation in the
  // grid behind it; PreviewBox holds its preview src in state set once at mount
  // (only mutated on crop), so it won't revert the src we set here.
  const handleRotated = () => {
    // Signed URLs carry their signature in the query string — appending our own
    // param would invalidate it, so fall back to a full reload there.
    if (asset.isUrlSigned) {
      window.location.reload();
      return;
    }

    const root = ref.current;
    const scope = root?.closest('[role="dialog"]') ?? document;
    const token = asset.hash || '';
    let busted = false;

    scope.querySelectorAll('img').forEach((img) => {
      const src = img.getAttribute('src');
      if (!src) return;
      // Only touch this asset's image(s): the hash appears in both the full and
      // the `thumbnail_`-prefixed URLs. When the hash is unavailable we fall back
      // to busting every <img> in the (small) dialog scope.
      if (token && !src.includes(token)) return;
      img.setAttribute('src', bustCache(src, Date.now()));
      busted = true;
    });

    // If the preview couldn't be located, reload so the user still sees the result.
    if (!busted) window.location.reload();
  };

  return (
    <div ref={ref}>
      <RotateActions fileId={asset.id} onRotated={handleRotated} />
    </div>
  );
};

export { RotatePreviewActions };
