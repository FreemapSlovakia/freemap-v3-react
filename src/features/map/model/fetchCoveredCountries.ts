import { httpRequest } from '@app/httpRequest.js';
import type { RootState } from '@app/store/store.js';
import type { ActionCreatorMatchable } from '@shared/cancelRegister.js';
import bboxPolygon from '@turf/bbox-polygon';
import z from 'zod';
import type { Bbox } from '../../mapArea/model/actions.js';

/**
 * Resolves the list of country codes covered by `bbox` via the geotools
 * endpoint. Pass `cancelActions` to abort the in-flight request when one of
 * those actions is dispatched (e.g. `[mapSetBounds]` for the live viewport);
 * defaults to no cancellation.
 */
export async function fetchCoveredCountries(
  getState: () => RootState,
  bbox: Bbox,
  cancelActions: ActionCreatorMatchable[] = [],
): Promise<string[]> {
  const res = await httpRequest({
    getState,
    method: 'POST',
    url: '/geotools/covered-countries',
    expectedStatus: 200,
    headers: { 'content-type': 'application/geo+json' },
    body: JSON.stringify(bboxPolygon(bbox)),
    cancelActions,
  });

  return z.array(z.string()).parse(await res.json());
}
