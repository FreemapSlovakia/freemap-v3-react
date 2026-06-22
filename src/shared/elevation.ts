import { httpRequest } from '@app/httpRequest.js';
import type { RootState } from '@app/store/store.js';
import type { ActionCreatorMatchable } from '@shared/cancelRegister.js';
import type { Feature, LineString } from 'geojson';
import z from 'zod';

const ElevationsSchema = z.array(z.number().nullable());

/**
 * Resolves elevation for a batch of `[lat, lon]` pairs via the elevation API.
 * Returns one value (or `null` where the API has no data) per input pair, in
 * the same order. An empty input resolves to an empty array without a request.
 */
export async function fetchElevations(
  latLons: [number, number][],
  getState: () => RootState,
  cancelActions?: ActionCreatorMatchable[],
): Promise<(number | null)[]> {
  if (latLons.length === 0) {
    return [];
  }

  const res = await httpRequest({
    getState,
    method: 'POST',
    url: '/geotools/elevation',
    data: latLons,
    expectedStatus: 200,
    cancelActions,
  });

  return ElevationsSchema.parse(await res.json());
}

/**
 * Returns copies of the given `LineString` features with elevation filled from
 * the server. `mode: 'missing'` fills only coordinates that lack a `z` ordinate
 * (length < 3); `mode: 'all'` overwrites every `z`. Coordinates the API has no
 * data for are left unchanged. Inputs are never mutated. With `'missing'` and
 * nothing to fill the input array is returned as-is (no request).
 */
export async function enrichElevations(
  features: Feature<LineString>[],
  mode: 'missing' | 'all',
  getState: () => RootState,
  cancelActions?: ActionCreatorMatchable[],
): Promise<Feature<LineString>[]> {
  const enriched = features.map((feature) => ({
    ...feature,
    geometry: {
      ...feature.geometry,
      coordinates: feature.geometry.coordinates.map((coord) => coord.slice()),
    },
  }));

  // Direct references into the cloned coordinates so we can write `z` back in
  // input order after the single batched request.
  const targets = enriched.flatMap((feature) =>
    feature.geometry.coordinates.filter(
      (coord) => mode === 'all' || coord.length < 3,
    ),
  );

  if (targets.length === 0) {
    return features;
  }

  const eles = await fetchElevations(
    targets.map((coord) => [coord[1]!, coord[0]!]),
    getState,
    cancelActions,
  );

  targets.forEach((coord, i) => {
    const ele = eles[i];

    if (ele != null) {
      coord[2] = ele;
    }
  });

  return enriched;
}
