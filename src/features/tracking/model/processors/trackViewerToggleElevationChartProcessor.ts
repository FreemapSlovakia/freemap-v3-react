import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import {
  elevationChartClose,
  elevationChartSetTrackGeojson,
} from '@features/elevationChart/model/actions.js';
import { trackViewerToggleElevationChart } from '@features/trackViewer/model/actions.js';
import { Feature, LineString } from 'geojson';

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
