import type { ReactElement, ReactNode } from 'react';

/**
 * A menu row's right-hand column: its shortcut, its marks, its submenu chevron.
 * They share one edge so a menu reads as a column, rather than sitting wherever
 * each label happens to end.
 *
 * **One per row.** Two auto margins share the free space between them, so a
 * second gutter lands mid-row rather than at the edge — put every trailing mark
 * in the same one. (`OnlineOnlyItem` appends its offline badge after the row's
 * gutter for exactly this reason.)
 *
 * **The offline badge goes last**, after the shortcut or chevron. It is the one
 * mark that comes and goes with the connection, and `OnlineOnlyItem` can only
 * put it there — so everything else keeps its column when it appears.
 *
 * `flex-shrink-0` because `.dropdown-item` wraps: the cluster moves to the next
 * line whole instead of being squashed.
 */
export function MenuGutter({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  return (
    <span className="d-flex align-items-center gap-1 ms-auto flex-shrink-0">
      {children}
    </span>
  );
}
