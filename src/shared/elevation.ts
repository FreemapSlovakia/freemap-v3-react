import { httpRequest } from '@app/httpRequest.js';
import type { RootState } from '@app/store/store.js';
import type { ActionCreatorMatchable } from '@shared/cancelRegister.js';
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
