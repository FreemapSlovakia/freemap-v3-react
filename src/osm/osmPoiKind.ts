import {
  getGenericNameFromOsmElementSync,
  resolveGenericName,
} from './osmNameResolver.js';
import { osmTagToIconMapping } from './osmTagToIconMapping.js';
import type { OsmMapping } from './types.js';

/**
 * An OSM element's POI icon and what kind of thing it is, as its marker and
 * tooltip show them; no kind until the mapping has loaded.
 */
export function osmPoiKind(
  tags: Record<string, string>,
  elementType: 'node' | 'way' | 'relation' | undefined,
  mapping: OsmMapping | undefined,
): { poi: string | undefined; generic: string } {
  return {
    poi: resolveGenericName(osmTagToIconMapping, tags)[0],
    generic:
      mapping && elementType
        ? getGenericNameFromOsmElementSync(
            tags,
            elementType,
            mapping.osmTagToNameMapping,
            mapping.colorNames,
          )
        : '',
  };
}
