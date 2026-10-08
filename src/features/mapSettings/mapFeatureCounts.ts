import type { RootState } from '@app/store/store.js';
import { keptSearchResultsSelector } from '@features/search/model/selectors.js';

const MAP_FEATURE_IDS = [
  'search',
  'objects',
  'tracking',
  'data',
  'route',
  'drawing',
  'changesets',
] as const;

export type MapFeatureId = (typeof MAP_FEATURE_IDS)[number];

/** Whether any tool's feature has a row in the Map layers panel. */
export const anyMapFeature = (state: RootState) =>
  MAP_FEATURE_IDS.some((id) => mapFeatureCount(state, id) !== undefined);

/**
 * How many items a tool's feature holds, or `undefined` while it has no row in
 * the Map layers panel. Objects keep theirs while the filter is on, and loaded
 * data while a file is loaded, even with nothing in them.
 */
export function mapFeatureCount(
  state: RootState,
  id: MapFeatureId,
): number | undefined {
  const some = (count: number) => (count > 0 ? count : undefined);

  switch (id) {
    case 'search':
      return some(keptSearchResultsSelector(state).length);

    case 'objects':
      return state.objects.active.length
        ? state.objects.objects.length
        : undefined;

    case 'tracking':
      return some(state.tracking.trackedDevices.length);

    case 'data':
      return state.trackViewer.trackGeojson?.features.length;

    case 'route':
      return some(state.routePlanner.points.length);

    case 'drawing':
      // Holes are part of their polygons, as in the list.
      return some(
        state.drawingLines.lines.reduce(
          (count, line) => count + (line.holeOfId === undefined ? 1 : 0),
          state.drawingPoints.points.length,
        ),
      );

    case 'changesets':
      return some(state.changesets.changesets.length);
  }
}
