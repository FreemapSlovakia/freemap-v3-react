import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import {
  elevationChartClose,
  elevationChartSetTrackGeojson,
} from '@features/elevationChart/model/actions.js';
import {
  trackViewerSetElevationPrompt,
  trackViewerToggleElevationChart,
} from '@features/trackViewer/model/actions.js';
import { elevationCoverage } from '@shared/geoutils.js';
import { Feature, LineString } from 'geojson';

export const trackViewerToggleElevationChartProcessor: Processor = {
  actionCreator: trackViewerToggleElevationChart,
  handle: async ({ dispatch, getState }) => {
    if (getState().elevationChart.elevationProfilePoints) {
      dispatch(elevationChartClose());

      return;
    }

    const { trackGeojson, elevationResolved } = getState().trackViewer;

    const lineFeatures =
      trackGeojson?.features.filter(
        (f): f is Feature<LineString> => f.geometry.type === 'LineString',
      ) ?? [];

    const first = lineFeatures[0];

    if (!first) {
      return;
    }

    // Prompt only when elevation is actually missing and the user hasn't
    // decided yet. A track with full elevation (from any source) opens the
    // chart straight away — overriding it is the explicit "update" button's
    // job. Partial/missing tracks ask how to fill; the chart's own API path
    // fills any gaps the user chooses to leave.
    if (elevationResolved || elevationCoverage(lineFeatures) === 'full') {
      window._paq.push(['trackEvent', 'TrackViewer', 'toggleElevationChart']);

      dispatch(elevationChartSetTrackGeojson(first));

      return;
    }

    dispatch(trackViewerSetElevationPrompt({ type: 'chart' }));
  },
};
