import { FeatureId, featureIdsEqual } from '@shared/types/featureId.js';
import { SearchResult } from '../../../search/model/actions.js';

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
