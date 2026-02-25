import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { searchSetQuery } from '../actions.js';

export const searchProcessor: Processor<typeof searchSetQuery> = {
  actionCreator: searchSetQuery,
  errorKey: 'search.fetchingError',
  handle: async (props) => {
    const { action } = props;

    const { query } = action.payload;

    if (!query) {
      return;
    }

    window._paq.push(['trackEvent', 'Search', 'search', query.slice(64)]);

    if (query.startsWith('@')) {
      const latlng = query
        .slice(1)
        .split(',')
        .map((coord) => Number(coord)) as [number, number];

      if (
        latlng.length === 2 &&
        latlng.every((coord) => !isNaN(coord)) &&
        latlng[0] <= 90 &&
        latlng[0] >= -90 &&
        latlng[1] <= 180 &&
        latlng[1] >= -180
      ) {
        await (
          await import(
            /* webpackChunkName: "map-details-processor-handler" */
            '@features/mapDetails/model/mapDetailsProcessorHandler.js'
          )
        ).default(latlng, props.getState, props.dispatch);

        return;
      }
    }

    (
      await import(
        /* webpackChunkName: "search-processor-handler" */
        './searchProcessorHandler.js'
      )
    ).handle(props);
  },
};
