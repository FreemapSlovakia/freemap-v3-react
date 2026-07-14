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
import { trackMatomo } from '@shared/trackMatomo.js';
import {
  isTrackLine,
  resolveActiveTrack,
  trackWaypoints,
} from '../../trackSelection.js';
import { ensureRenderGeojson } from '../ensureRenderGeojson.js';

export const trackViewerToggleElevationChartProcessor: Processor = {
  actionCreator: trackViewerToggleElevationChart,
  handle: async ({ dispatch, getState }) => {
    if (getState().elevationChart.elevationProfilePoints) {
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
      trackMatomo(['trackEvent', 'TrackViewer', 'toggleElevationChart']);

      // Densify a sparse line first so the chart isn't a coarse straight-segment
      // profile; a no-op (and so a fall back to the recorded line) when nothing
      // needs subdividing.
      await ensureRenderGeojson(getState, dispatch);

      // The densified copy keeps feature order, so the active track is at the
      // same index; fall back to the recorded feature when it wasn't densified.
      const rendered =
        getState().trackViewer.renderTrackGeojson?.features[active.index];

      dispatch(
        elevationChartSetTrackGeojson(
          rendered && isTrackLine(rendered) ? rendered : active.feature,
          true,
          trackWaypoints(trackGeojson),
        ),
      );

      return;
    }

    dispatch(trackViewerSetElevationPrompt({ type: 'chart' }));
  },
};
