import { Processor } from '@app/store/middleware/processorMiddleware.js';
import { mapSetBounds, mapSetCountries } from '../actions.js';
import { fetchCoveredCountries } from '../fetchCoveredCountries.js';

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

        dispatch(
          mapSetCountries(
            await fetchCoveredCountries(getState, bounds, [mapSetBounds]),
          ),
        );
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
