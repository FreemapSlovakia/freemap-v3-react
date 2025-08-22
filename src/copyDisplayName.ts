import { SearchResult } from 'actions/searchActions.js';
import { FeatureId, featureIdsEqual } from './types/featureId.js';

// keep display_name from nominatim
export function copyDisplayName(
  sr: SearchResult | null,
  osmId: FeatureId,
  tags: Record<string, string>,
) {
  if (sr && featureIdsEqual(sr.id, osmId)) {
    const { geojson } = sr;

    if (geojson.type === 'Feature' && geojson.properties?.['display_name']) {
      tags['display_name'] = geojson.properties['display_name'];
    }
  }
}
