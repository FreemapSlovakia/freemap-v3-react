import type { Bbox } from './model/actions.js';

// Shrink a `[west, south, east, north]` bbox towards its center so the drawn
// rectangle starts clearly inside the visible map with grabbable handles.
export function insetBbox(
  [w, s, e, n]: [number, number, number, number],
  ratio = 0.15,
): Bbox {
  const dx = (e - w) * ratio;

  const dy = (n - s) * ratio;

  return [w + dx, s + dy, e - dx, n - dy];
}
