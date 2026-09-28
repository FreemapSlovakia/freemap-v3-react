import type { ReactElement } from 'react';

/** A row of buttons, for "show in toolbar"; sized and coloured like react-icons. */
export function ToolbarIcon(): ReactElement {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="currentColor"
      stroke="none"
      style={{ verticalAlign: '-0.125em' }}
    >
      <rect x="1" y="8.5" width="6.5" height="7" rx="1.25" />
      <rect x="8.75" y="8.5" width="6.5" height="7" rx="1.25" />
      <rect x="16.5" y="8.5" width="6.5" height="7" rx="1.25" />
    </svg>
  );
}
