import { httpRequest } from '@app/httpRequest.js';
import type { RootState } from '@app/store/store.js';
import type { CancelTriggers } from '@shared/cancelRegister.js';
import { type OsmResult, OsmResultSchema } from './types.js';

type OsmElementType = 'node' | 'way' | 'relation';

// OSM_ELEMENT_SOURCE selects where by-id element lookups go: the internal
// Overpass instance (OVERPASS_URL) or the public OSM API (OSM_API_URL).
const useOverpass = process.env['OSM_ELEMENT_SOURCE'] !== 'osm-api';

// Overpass QL equivalent of the OSM API `/full.json`: a node on its own, or a
// way/relation together with the nodes (and member ways) it references, so the
// caller can assemble geometry. `(._;>;)` recurses down to those members.
function overpassBody(elementType: OsmElementType, id: number): string {
  if (elementType === 'node') {
    return `[out:json];node(${id});out;`;
  }

  const set = elementType === 'way' ? 'way' : 'rel';

  return `[out:json];${set}(${id});(._;>;);out;`;
}

function osmApiUrl(elementType: OsmElementType, id: number): string {
  const base = process.env['OSM_API_URL'];

  return elementType === 'node'
    ? `${base}/api/0.6/node/${id}.json`
    : `${base}/api/0.6/${elementType}/${id}/full.json`;
}

/**
 * Fetches an OSM element with its dependencies (member nodes/ways) and returns
 * the parsed `elements` array. The Overpass and OSM API responses share the
 * same element shape, so `OsmResultSchema` parses either unchanged.
 */
export async function fetchOsmElements(
  elementType: OsmElementType,
  id: number,
  options: { getState: () => RootState } & CancelTriggers,
): Promise<OsmResult> {
  const res = await httpRequest(
    useOverpass
      ? {
          ...options,
          method: 'POST',
          url: process.env['OVERPASS_URL']!,
          headers: { 'Content-Type': 'text/plain' },
          body: overpassBody(elementType, id),
          expectedStatus: 200,
        }
      : {
          ...options,
          url: osmApiUrl(elementType, id),
          expectedStatus: 200,
        },
  );

  const result = OsmResultSchema.parse(await res.json());

  // The OSM API answers a missing element with 404 (which httpRequest turns
  // into a throw); Overpass answers with 200 and an empty set. Normalize the
  // latter to a throw so every caller surfaces the same "not found" error
  // instead of silently rendering nothing.
  if (result.elements.length === 0) {
    throw new Error(`OSM ${elementType} ${id} not found`);
  }

  return result;
}
