import type { ReactElement } from 'react';

/**
 * Which part of the whole a zoomed plot shows, as a thumb on a track; nothing
 * while it shows all. Informative only. `view` spans fractions of the whole.
 */
export function ViewIndicator({
  x,
  y,
  width,
  view,
}: {
  x: number;
  y: number;
  width: number;
  view: { from: number; to: number };
}): ReactElement | null {
  if (view.to - view.from >= 1) {
    return null;
  }

  const w = Math.max(width * (view.to - view.from), 6);

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={3}
        rx={1.5}
        fill="var(--bs-secondary)"
        opacity={0.25}
      />

      <rect
        x={Math.min(x + width * view.from, x + width - w)}
        y={y}
        width={w}
        height={3}
        rx={1.5}
        fill="var(--bs-primary)"
        opacity={0.8}
      />
    </g>
  );
}
