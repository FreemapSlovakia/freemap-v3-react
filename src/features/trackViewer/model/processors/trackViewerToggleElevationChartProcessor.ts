import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import {
  elevationChartClose,
  elevationChartSetTrackGeojson,
} from '@features/elevationChart/model/actions.js';
import {
  trackViewerSetElevationPrompt,
  trackViewerToggleElevationChart,
} from '@features/trackViewer/model/actions.js';
import { Feature, LineString } from 'geojson';

export const trackViewerToggleElevationChartProcessor: Processor = {
  actionCreator: trackViewerToggleElevationChart,
  handle: async ({ dispatch, getState }) => {
    if (getState().elevationChart.elevationProfilePoints) {
      dispatch(elevationChartClose());

      return;
    }

    const { trackGeojson, elevationResolved } = getState().trackViewer;

    const first = trackGeojson?.features.find(
      (f): f is Feature<LineString> => f.geometry.type === 'LineString',
    );

    if (!first) {
      return;
    }

    // Already decided for this track: open the chart straight away. The chart's
    // own API path fills any elevation the user chose to leave as gaps.
    if (elevationResolved) {
      window._paq.push(['trackEvent', 'TrackViewer', 'toggleElevationChart']);

      dispatch(elevationChartSetTrackGeojson(first));

      return;
    }

    // First time: the user decides whether to fill gaps, override every point
    // from the terrain model (often more precise than recorded data), or keep
    // the recorded elevation. The prompt processor then opens the chart.
    dispatch(trackViewerSetElevationPrompt('chart'));
  },
};
