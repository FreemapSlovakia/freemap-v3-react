import { elevationChartSetTrackGeojson } from '../actions/elevationChartActions.js';
import { Processor } from '../middlewares/processorMiddleware.js';

export const elevationChartProcessor: Processor<
  typeof elevationChartSetTrackGeojson
> = {
  actionCreator: elevationChartSetTrackGeojson,
  errorKey: 'elevationChart.fetchError',
  handle: async (...params) =>
    (await import('./elevationChartProcessorHandler.js')).default(...params),
};
