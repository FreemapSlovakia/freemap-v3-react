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
import { Feature, LineString, MultiLineString } from 'geojson';
import { ensureRenderGeojson } from '../ensureRenderGeojson.js';

// A multi-segment recording arrives as a single `MultiLineString` feature; it's
// one track, charted as one unit (segments laid end-to-end).
const isLineLike = (f: Feature): f is Feature<LineString | MultiLineString> =>
  f.geometry.type === 'LineString' || f.geometry.type === 'MultiLineString';

export const trackViewerToggleElevationChartProcessor: Processor = {
  actionCreator: trackViewerToggleElevationChart,
  handle: async ({ dispatch, getState }) => {
    if (getState().elevationChart.elevationProfilePoints) {
      dispatch(elevationChartClose());

      return;
    }

    const { trackGeojson, elevationDecision } = getState().trackViewer;

    const lineFeatures = trackGeojson?.features.filter(isLineLike) ?? [];

    const first = lineFeatures[0];

    if (!first) {
      return;
    }

    // Prompt only when elevation is actually missing and the user hasn't
    // decided yet. A track with full elevation (from any source) opens the
    // chart straight away — overriding it is the explicit "update" button's
    // job. The chart renders the recorded coordinates as-is, so a track the
    // user chose to keep partial shows its gaps instead of a fabricated
    // server profile.
    if (
      elevationDecision !== 'undecided' ||
      elevationCoverage(lineFeatures) === 'full'
    ) {
      window._paq.push(['trackEvent', 'TrackViewer', 'toggleElevationChart']);

      // Densify a sparse line first so the chart isn't a coarse straight-segment
      // profile; a no-op (and so a fall back to the recorded line) when nothing
      // needs subdividing.
      await ensureRenderGeojson(getState, dispatch);

      const renderFirst =
        getState().trackViewer.renderTrackGeojson?.features.find(isLineLike) ??
        first;

      dispatch(elevationChartSetTrackGeojson(renderFirst, true));

      return;
    }

    dispatch(trackViewerSetElevationPrompt({ type: 'chart' }));
  },
};
