import { Feature, LineString } from '@turf/helpers';
import {
  elevationChartClose,
  elevationChartSetTrackGeojson,
} from 'fm3/actions/elevationChartActions';
import { trackViewerToggleElevationChart } from 'fm3/actions/trackViewerActions';
import { Processor } from 'fm3/middlewares/processorMiddleware';

export const trackViewerToggleElevationChartProcessor: Processor = {
  actionCreator: trackViewerToggleElevationChart,
  handle: async ({ dispatch, getState }) => {
    if (getState().elevationChart.trackGeojson) {
      dispatch(elevationChartClose());
    } else {
      const { trackGeojson } = getState().trackViewer;

      for (const feature of trackGeojson?.features ?? []) {
        if (feature.geometry.type === 'LineString') {
          dispatch(
            elevationChartSetTrackGeojson(feature as Feature<LineString>),
          );
        }
      }
    }
  },
};
