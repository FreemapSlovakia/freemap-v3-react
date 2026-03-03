import { httpRequest } from '@app/httpRequest.js';
import { Processor } from '@app/store/middleware/processorMiddleware.js';
import bboxPolygon from '@turf/bbox-polygon';
import { assert } from 'typia';
import { mapSetBounds, mapSetCountries } from '../actions.js';

export const getCountriesProcessor: Processor = {
  // stateChangePredicate: (state) => state.map.bounds, // we use actionCreator because it also cancels
  actionCreator: mapSetBounds,
  handle: async ({ getState, dispatch }) => {
    setTimeout(() => {
      // prevent progress indication
      (async () => {
        const { bounds } = getState().map;

        if (!bounds) {
          return;
        }

        const res = await httpRequest({
          getState,
          method: 'POST',
          url: '/geotools/covered-countries',
          expectedStatus: 200,
          headers: { 'content-type': 'application/geo+json' },
          body: JSON.stringify(bboxPolygon(bounds)),
          cancelActions: [mapSetBounds],
        });

        dispatch(mapSetCountries(assert<string[]>(await res.json())));
      })().catch((err) => {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return;
        }

        console.error(err);

        if (getState().map.countries) {
          dispatch(mapSetCountries(undefined));
        }

        // TODO toast
      });
    });
  },
};
