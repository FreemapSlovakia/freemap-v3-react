import { isToolOpen } from '@app/store/selectors.js';
import type { RootState } from '@app/store/store.js';
import { listedChangesetsSelector } from '@features/changesets/model/selectors.js';
import { selectRecorderLines } from '@features/gpsRecorder/model/selectors.js';
import { FEATURE_TECHNOLOGIES } from '@features/map/model/layerKind.js';
import {
  mapByIdSelector,
  mapEntryOf,
} from '@features/mapLibrary/model/selectors.js';
import { keptSearchResultsSelector } from '@features/search/model/selectors.js';

const MAP_FEATURE_IDS = [
  'search',
  'objects',
  'gps-recorder',
  'tracking',
  'data',
  'route',
  'changesets',
] as const;

export type MapFeatureId = (typeof MAP_FEATURE_IDS)[number];

const anyFeatureLayer = (state: RootState) => {
  const byId = mapByIdSelector(state);

  return state.map.layers.some((id) =>
    FEATURE_TECHNOLOGIES.has(mapEntryOf(byId[id])?.technology ?? ''),
  );
};

/** Whether any tool's feature has a row in the Map layers panel. */
const anyMapFeature = (state: RootState) =>
  MAP_FEATURE_IDS.some((id) => mapFeatureCount(state, id) !== undefined);

/**
 * Whether hiding the features would hide anything: the rows' features, and
 * what `Results` draws with no row — a search preview, a recording with no line
 * yet, tracks, the panorama's marks — and the feature layers (photos, events…),
 * by being on rather than by what they loaded, which changes with every pan.
 */
export const anyFeatureDrawn = (state: RootState) =>
  anyMapFeature(state) ||
  anyFeatureLayer(state) ||
  state.search.selectedResults.length > 0 ||
  state.tracking.tracks.length > 0 ||
  state.gpsRecorder.points.length > 0 ||
  Boolean(state.gpsRecorder.status?.recording) ||
  (state.panorama.viewpoint !== null && isToolOpen(state, 'panorama'));

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

    case 'gps-recorder':
      return some(selectRecorderLines(state).length);

    case 'tracking':
      return some(state.tracking.trackedDevices.length);

    case 'data':
      return state.trackViewer.trackGeojson?.features.length;

    case 'route':
      return some(state.routePlanner.points.length);

    case 'changesets': {
      const listed = listedChangesetsSelector(state).length;

      // Inspecting keeps the row, whose page lists the elements, also while
      // the changeset loads.
      return state.changesetInspector.inspected
        ? Math.max(listed, 1)
        : some(listed);
    }
  }
}
