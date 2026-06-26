/**
 * Inline SVG icons — self-contained so the plugin never depends on a specific
 * @strapi/icons export name across versions.
 */

export const RotateRightIcon = (props) => (
  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" aria-hidden focusable="false" {...props}>
    <path
      d="M21 12a9 9 0 1 1-2.64-6.36"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M21 3v5h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const RotateLeftIcon = (props) => (
  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" aria-hidden focusable="false" {...props}>
    <path
      d="M3 12a9 9 0 1 0 2.64-6.36"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M3 3v5h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const PluginIcon = (props) => (
  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" aria-hidden focusable="false" {...props}>
    <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
    <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
    <path d="m21 15-5-5L5 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
