import {
  elevationChartClose,
  elevationChartSetTrackGeojson,
} from 'fm3/actions/elevationChartActions';
import { trackViewerToggleElevationChart } from 'fm3/actions/trackViewerActions';
import { Processor } from 'fm3/middlewares/processorMiddleware';
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
