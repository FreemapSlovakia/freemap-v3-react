import { clearMapFeatures } from '@app/store/actions.js';
import type { RootState } from '@app/store/store.js';
import { searchSelectResult } from '@features/search/model/actions.js';
import type { OsmFeatureId } from '@shared/types/featureId.js';
import {
  assembleOsmGeojson,
  indexOsmElements,
  type OsmGeojson,
} from './assembleOsmGeojson.js';
import { fetchOsmElements } from './fetchOsmElements.js';

// Fetches one OSM element with its dependencies and assembles its geometry.
// The dispatch-side concerns (copyDisplayName, searchSelectResult) live in the
// osmLoad processor; this helper only deals with the fetch → assemble pipeline
// so it can be reused by convertToDrawingProcessor's `objects-geometry` path
// without round-tripping through the search store.
export async function fetchOsmFullGeojson(
  osmId: OsmFeatureId,
  getState: () => RootState,
): Promise<OsmGeojson> {
  const data = await fetchOsmElements([osmId], {
    getState,
    cancelActions: [clearMapFeatures, searchSelectResult],
  });

  const geojson = assembleOsmGeojson(osmId, indexOsmElements(data));

  // The one element asked for isn't there, so there is nothing to answer with:
  // a throw, which the caller reports, rather than a quiet nothing-happened.
  if (!geojson) {
    throw new Error(`OSM ${osmId.elementType} ${osmId.id} not found`);
  }

  return geojson;
}
