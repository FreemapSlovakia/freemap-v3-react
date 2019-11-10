import {
  elevationChartSetTrackGeojson,
  elevationChartClose,
} from 'fm3/actions/elevationChartActions';
import { Processor } from 'fm3/middlewares/processorMiddleware';
import { trackViewerToggleElevationChart } from 'fm3/actions/trackViewerActions';

export const trackViewerToggleElevationChartProcessor: Processor = {
  actionCreator: trackViewerToggleElevationChart,
  handle: async ({ dispatch, getState }) => {
    if (getState().elevationChart.trackGeojson) {
      dispatch(elevationChartClose());
    } else {
      const { trackGeojson } = getState().trackViewer;

      if (trackGeojson?.features[0]) {
        // this is bit confusing. TrackViewerMenu.props.trackGeojson is actually a feature set of geojsons
        // (thought typically contains only one geojson),
        // while in ElevationChart.props.trackGeojson we use first "real" feature, e.g. LineString
        dispatch(elevationChartSetTrackGeojson(trackGeojson.features[0]));
      }
    }
  },
};
