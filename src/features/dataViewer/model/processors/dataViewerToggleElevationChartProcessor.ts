import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import {
  trackViewerSetElevationPrompt,
  trackViewerToggleElevationChart,
} from '@features/dataViewer/model/actions.js';
import {
  elevationChartClose,
  elevationChartOpen,
} from '@features/elevationChart/model/actions.js';
import { elevationCoverage } from '@shared/geoutils.js';
import { resolveActiveTrack } from '../../trackSelection.js';

export const dataViewerToggleElevationChartProcessor: Processor = {
  actionCreator: trackViewerToggleElevationChart,
  handle: async ({ dispatch, getState }) => {
    if (getState().elevationChart.target?.type === 'track-viewer') {
      dispatch(elevationChartClose());

      return;
    }

    const { trackGeojson, elevationDecision, selectedTrackIndex } =
      getState().trackViewer;

    const active = resolveActiveTrack(trackGeojson, selectedTrackIndex);

    if (!active) {
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
      elevationCoverage([active.feature]) === 'full'
    ) {
      // `elevationChartProcessor` draws it from here — it densifies a sparse
      // line and states the credit, so the toggle and a URL-restored chart take
      // one path.
      dispatch(elevationChartOpen({ type: 'track-viewer' }));

      return;
    }

    dispatch(trackViewerSetElevationPrompt({ type: 'chart' }));
  },
};
