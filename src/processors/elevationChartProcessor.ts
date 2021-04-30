import { elevationChartSetTrackGeojson } from 'fm3/actions/elevationChartActions';
import { Processor } from 'fm3/middlewares/processorMiddleware';

export const elevationChartProcessor: Processor = {
  actionCreator: elevationChartSetTrackGeojson,
  errorKey: 'elevationChart.fetchError',
  async handle(...params) {
    (
      await import(
        /* webpackChunkName: "elevationChartProcessorHandler" */ './elevationChartProcessorHandler'
      )
    ).default(...params);
  },
};
