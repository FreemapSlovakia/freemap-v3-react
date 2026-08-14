import { HttpError, httpRequest } from '@app/httpRequest.js';
import type { RootState } from '@app/store/store.js';
import type { CancelTriggers } from '@shared/cancelRegister.js';
import { type OsmFeatureId, osmElementTypes } from '@shared/types/featureId.js';
import { type OsmResult, OsmResultSchema } from './types.js';

// OSM_ELEMENT_SOURCE selects where by-id element lookups go: the internal
// Overpass instance (OVERPASS_URL) or the public OSM API (OSM_API_URL).
const useOverpass = process.env['OSM_ELEMENT_SOURCE'] !== 'osm-api';

const overpassSets = { node: 'node', way: 'way', relation: 'rel' } as const;

// Overpass QL equivalent of the OSM API `/full.json`, for any number of
// elements at once: one `(id:…)` filter per element type, then `(._;>;)` to
// recurse down to the nodes (and member ways) the caller assembles geometry
// from.
function overpassBody(ids: readonly OsmFeatureId[]): string {
  const sets = osmElementTypes
    .map((elementType) => {
      const of = ids.filter((id) => id.elementType === elementType);

      return of.length === 0
        ? ''
        : `${overpassSets[elementType]}(id:${of.map(({ id }) => id).join(',')});`;
    })
    .join('');

  return `[out:json];(${sets});(._;>;);out;`;
}

function osmApiUrl({ elementType, id }: OsmFeatureId): string {
  const base = process.env['OSM_API_URL'];

  return elementType === 'node'
    ? `${base}/api/0.6/node/${id}.json`
    : `${base}/api/0.6/${elementType}/${id}/full.json`;
}

/**
 * Fetches OSM elements with their dependencies (member nodes/ways) and returns
 * the parsed `elements` array of them all. Overpass answers any number of
 * elements in one query, which is what makes opening a link naming fifty of
 * them a single request; the OSM API has no such endpoint, so there it stays a
 * request per element and the answers are concatenated. Both share the same
 * element shape, so `OsmResultSchema` parses either unchanged.
 *
 * An element that doesn't exist is simply left out of the result — telling
 * which of a batch came back is `assembleOsmGeojson`'s job, since only the
 * caller knows what a missing one means for it.
 */
export async function fetchOsmElements(
  ids: readonly OsmFeatureId[],
  options: { getState: () => RootState } & CancelTriggers,
): Promise<OsmResult> {
  if (ids.length === 0) {
    return { elements: [] };
  }

  if (useOverpass) {
    const res = await httpRequest({
      ...options,
      method: 'POST',
      url: process.env['OVERPASS_URL']!,
      headers: { 'Content-Type': 'text/plain' },
      body: overpassBody(ids),
      expectedStatus: 200,
    });

    return OsmResultSchema.parse(await res.json());
  }

  const results = await Promise.allSettled(
    ids.map(async (id) =>
      OsmResultSchema.parse(
        await (
          await httpRequest({
            ...options,
            url: osmApiUrl(id),
            expectedStatus: 200,
          })
        ).json(),
      ),
    ),
  );

  // 404 and 410 are how the OSM API says an element never existed or is
  // deleted, which is a missing element rather than a failed fetch — anything
  // else is one, and fails the whole batch. Otherwise one request going wrong
  // (or being aborted) would read as its element having been deleted, and take
  // the pin off the map.
  for (const result of results) {
    if (
      result.status === 'rejected' &&
      !(
        result.reason instanceof HttpError &&
        (result.reason.status === 404 || result.reason.status === 410)
      )
    ) {
      throw result.reason;
    }
  }

  return {
    elements: results.flatMap((result) =>
      result.status === 'fulfilled' ? result.value.elements : [],
    ),
  };
}
