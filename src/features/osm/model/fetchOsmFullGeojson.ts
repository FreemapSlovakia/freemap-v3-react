import { clearMapFeatures } from '@app/store/actions.js';
import type { RootState } from '@app/store/store.js';
import { searchSelectResult } from '@features/search/model/actions.js';
import { fetchOsmFeaturesById } from '@shared/osmApi.js';
import type { OsmFeatureId } from '@shared/types/featureId.js';
import type { OsmGeojson } from './osmGeojson.js';
import { toOsmGeojson } from './osmGeojson.js';

// Fetches one OSM element with its geometry. The dispatch-side concerns
// (copyDisplayName, searchSelectResult) live in the osmLoad processor; this
// helper only deals with the fetch so it can be reused by
// convertToDrawingProcessor's `objects-geometry` path without round-tripping
// through the search store.
export async function fetchOsmFullGeojson(
  osmId: OsmFeatureId,
  getState: () => RootState,
): Promise<OsmGeojson> {
  const byId = await fetchOsmFeaturesById([osmId], {
    getState,
    cancelActions: [clearMapFeatures, searchSelectResult],
  });

  const feature = byId.get(`${osmId.elementType}/${osmId.id}`);

  // The one element asked for isn't there, so there is nothing to answer with:
  // a throw, which the caller reports, rather than a quiet nothing-happened.
  if (!feature) {
    throw new Error(`OSM ${osmId.elementType} ${osmId.id} not found`);
  }

  return toOsmGeojson(feature);
}
