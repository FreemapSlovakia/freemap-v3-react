import { Fragment, type ReactNode } from 'react';

/**
 * The items that say something, joined by " · ", each kept whole where it fits
 * a line: lines break between them, and only an item wider than a line wraps
 * within itself. With `className`, in a div of its own; nothing at all when no
 * item says anything.
 */
export function DetailItems({
  items,
  className,
}: {
  items: ReactNode[];
  className?: string;
}): ReactNode {
  const shown = items.filter(
    (item) =>
      item !== false && item !== null && item !== undefined && item !== '',
  );

  if (shown.length === 0) {
    return null;
  }

  const joined = shown.map((item, i) => (
    // Items have no identity beyond their place.
    <Fragment key={i}>
      <span className="d-inline-block mw-100">
        {item}
        {i < shown.length - 1 && ' ·'}
      </span>
      {i < shown.length - 1 && ' '}
    </Fragment>
  ));

  return className ? <div className={className}>{joined}</div> : joined;
}
