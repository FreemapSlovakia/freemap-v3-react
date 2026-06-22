import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import {
  elevationChartClose,
  elevationChartSetTrackGeojson,
} from '@features/elevationChart/model/actions.js';
import {
  trackViewerSetElevationPrompt,
  trackViewerToggleElevationChart,
} from '@features/trackViewer/model/actions.js';
import { containsElevations } from '@shared/geoutils.js';
import { Feature, LineString } from 'geojson';

export const trackViewerToggleElevationChartProcessor: Processor = {
  actionCreator: trackViewerToggleElevationChart,
  handle: async ({ dispatch, getState }) => {
    if (getState().elevationChart.elevationProfilePoints) {
      dispatch(elevationChartClose());

      return;
    }

    const feature = getState().trackViewer.trackGeojson?.features.find(
      (f): f is Feature<LineString> => f.geometry.type === 'LineString',
    );

    if (!feature) {
      return;
    }

    // The chart can fetch missing elevation from the server, but for an
    // imported track the user decides whether to fill only the gaps or
    // override everything — so prompt instead of silently fetching.
    if (!containsElevations(feature)) {
      dispatch(trackViewerSetElevationPrompt('chart'));

      return;
    }

    window._paq.push(['trackEvent', 'TrackViewer', 'toggleElevationChart']);

    dispatch(elevationChartSetTrackGeojson(feature));
  },
};
