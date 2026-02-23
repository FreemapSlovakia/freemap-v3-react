import { elevationChartSetTrackGeojson } from '../../../actions/elevationChartActions.js';
import type { Processor } from '../../../middlewares/processorMiddleware.js';

export const elevationChartProcessor: Processor<
  typeof elevationChartSetTrackGeojson
> = {
  actionCreator: elevationChartSetTrackGeojson,
  errorKey: 'elevationChart.fetchError',
  handle: async (...params) =>
    (
      await import(
        /* webpackChunkName: "elevation-chart-processor-handler" */
        './elevationChartProcessorHandler.js'
      )
    ).default(...params),
};
