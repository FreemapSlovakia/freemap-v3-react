import { elevationChartSetTrackGeojson } from 'fm3/actions/elevationChartActions';
import { Processor } from 'fm3/middlewares/processorMiddleware';

export const elevationChartProcessor: Processor<
  typeof elevationChartSetTrackGeojson
> = {
  actionCreator: elevationChartSetTrackGeojson,
  errorKey: 'elevationChart.fetchError',
  handle: async (...params) =>
    (await import('./elevationChartProcessorHandler')).default(...params),
};
