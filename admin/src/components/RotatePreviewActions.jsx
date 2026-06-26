import { RotateActions } from './RotateActions';

/**
 * Inline rotate controls (left / right 90°) for a single Media Library asset.
 *
 * Rendered inside @strapi/upload's `PreviewBox` action row — which is shared by
 * BOTH the standalone Media Library asset dialog AND the Content Manager
 * media-field asset dialog. Strapi 5's upload plugin exposes no admin injection
 * zone, so the plugin publishes this component on a global in `bootstrap()` and
 * a tiny patch to `@strapi/upload` renders it (see the cms `patches/` dir).
 *
 * @param {object} props
 * @param {{ id?: number, mime?: string, isLocal?: boolean }} props.asset
 */
const RotatePreviewActions = ({ asset }) => {
  // Only persisted raster images: skip freshly-added local files (no id yet),
  // non-images, and the formats sharp can't losslessly rotate (SVG / GIF).
  if (!asset || !asset.id || asset.isLocal) return null;
  const mime = typeof asset.mime === 'string' ? asset.mime.toLowerCase() : '';
  if (!mime.startsWith('image/') || mime === 'image/svg+xml' || mime === 'image/gif') {
    return null;
  }

  // Rotation overwrites the asset in place (URL unchanged), so the dialog/grid
  // won't repaint on its own — reload to show the rotated bytes + thumbnails.
  return <RotateActions fileId={asset.id} onRotated={() => window.location.reload()} />;
};

export { RotatePreviewActions };
