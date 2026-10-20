import type { ReactElement, ReactNode } from 'react';

/**
 * A menu row's label text, the part that gives way with an ellipsis when the
 * row doesn't fit; its icon and `MenuGutter` stay outside it, whole. No
 * `TruncatedText`: its long-press tooltip would take a link row's context menu.
 */
export function MenuLabel({ children }: { children: ReactNode }): ReactElement {
  return <span className="text-truncate min-w-0">{children}</span>;
}
