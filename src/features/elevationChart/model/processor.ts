import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { elevationChartSetTrackGeojson } from './actions.js';

export const elevationChartProcessor: Processor<
  typeof elevationChartSetTrackGeojson
> = {
  actionCreator: elevationChartSetTrackGeojson,
  errorKey: 'elevationChart.fetchError',
  handle: async (...params) =>
    (
      await import(
        /* webpackChunkName: "elevation-chart-processor-handler" */
        './processorHandler.js'
      )
    ).default(...params),
};
