import type { Selection } from '@app/store/actions.js';
import { featureIdsEqual } from './types/featureId.js';

/** Whether two selections name the same feature. */
export function sameSelection(
  a: Selection | null,
  b: Selection | null,
): boolean {
  if (!a || !b || a.type !== b.type) {
    return false;
  }

  if (a.type === 'line-point' && b.type === 'line-point') {
    return a.lineIndex === b.lineIndex && a.pointId === b.pointId;
  }

  if (!('id' in a) || !('id' in b)) {
    return false;
  }

  return typeof a.id === 'object' && typeof b.id === 'object'
    ? featureIdsEqual(a.id, b.id)
    : a.id === b.id;
}

/**
 * The kinds `deleteFeature` removes one of; a route leg, an object or a
 * changeset is nothing of the user's to remove.
 */
export const DELETABLE_SELECTIONS: ReadonlySet<Selection['type']> = new Set([
  'line-point',
  'draw-line-poly',
  'draw-points',
  'route-point',
  'data-viewer',
  'tracking',
  'search',
]);
