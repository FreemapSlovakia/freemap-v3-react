import { Feature, LineString } from 'geojson';
import {
  elevationChartClose,
  elevationChartSetTrackGeojson,
} from '../actions/elevationChartActions.js';
import { trackViewerToggleElevationChart } from '../actions/trackViewerActions.js';
import type { Processor } from '../middlewares/processorMiddleware.js';

export const trackViewerToggleElevationChartProcessor: Processor = {
  actionCreator: trackViewerToggleElevationChart,
  handle: async ({ dispatch, getState }) => {
    if (getState().elevationChart.elevationProfilePoints) {
      dispatch(elevationChartClose());
    } else {
      const { trackGeojson } = getState().trackViewer;

      for (const feature of trackGeojson?.features ?? []) {
        if (feature.geometry.type === 'LineString') {
          window._paq.push([
            'trackEvent',
            'TrackViewer',
            'showElevationProfile',
          ]);

          dispatch(
            elevationChartSetTrackGeojson(feature as Feature<LineString>),
          );

          break;
        }
      }
    }
  },
};
