import type { SearchResult } from '@features/search/model/actions.js';
import { type FeatureId, featureIdsEqual } from '@shared/types/featureId.js';

// keep display_name from nominatim
export function copyDisplayName(
  shown: SearchResult[],
  osmId: FeatureId,
  tags: Record<string, string>,
) {
  const sr = shown.find((result) => featureIdsEqual(result.id, osmId));

  if (sr) {
    const { geojson } = sr;

    if (geojson.type === 'Feature' && geojson.properties?.['display_name']) {
      tags['display_name'] = geojson.properties['display_name'];
    }
  }
}
