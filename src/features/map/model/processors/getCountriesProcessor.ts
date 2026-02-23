import { Processor } from '@app/store/middleware/processorMiddleware.js';
import { CRS } from 'leaflet';
import { assert } from 'typia';
import { httpRequest } from '@app/httpRequest.js';
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

        const min = CRS.EPSG3857.project({ lng: bounds[0], lat: bounds[1] });
        const max = CRS.EPSG3857.project({ lng: bounds[2], lat: bounds[3] });

        const res = await httpRequest({
          getState,
          method: 'POST',
          url: '/geotools/in-count',
          expectedStatus: 200,
          body: `POLYGON((${min.x} ${min.y}, ${max.x} ${min.y}, ${max.x} ${max.y}, ${min.x} ${max.y}, ${min.x} ${min.y}))`,
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
