import type { SearchResult } from '@features/search/model/actions.js';
import { resultCoords } from '@features/search/model/resultUtils.js';
import {
  getGenericNameFromOsmElementSync,
  getNameFromOsmElement,
  getOsmMapping,
} from '@osm/osmNameResolver.js';
import { stringifyFeatureId } from '@shared/types/featureId.js';

/**
 * Names a result the way the app's own lists do. An element found around a
 * point arrives carrying nothing but its tags, and what the user reads
 * ("Picnic table", "Guidepost") is resolved from them — so an agent given the
 * bare result would see no name at all.
 */
export async function makeResultDescriber(language: string) {
  const { osmTagToNameMapping, colorNames } = await getOsmMapping(language);

  return (result: SearchResult, index: number) => {
    const coords = resultCoords(result);

    const tags: Record<string, string> =
      result.geojson.type === 'Feature'
        ? ((result.geojson.properties ?? {}) as Record<string, string>)
        : {};

    const generic =
      result.genericName ||
      (result.id.type === 'osm'
        ? getGenericNameFromOsmElementSync(
            tags,
            result.id.elementType,
            osmTagToNameMapping,
            colorNames,
          )
        : '');

    return {
      index,
      name:
        result.displayName ||
        getNameFromOsmElement(tags, language) ||
        generic ||
        stringifyFeatureId(result.id),
      kind: generic || undefined,
      address: result.address,
      lat: coords?.lat,
      lon: coords?.lon,
      source: result.source,
    };
  };
}
