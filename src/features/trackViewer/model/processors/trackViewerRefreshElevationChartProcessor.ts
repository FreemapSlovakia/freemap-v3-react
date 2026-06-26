import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { resolveActiveTrack } from '../../trackSelection.js';

// Keeps an already-open elevation chart in sync when the track it shows changes
// — its elevation is refilled from the server (the "update elevation" button, or
// a colorize/info fill while the chart is showing), or the user switches which
// track is active. The active feature's reference changes on either a data
// change or a selection change, so one `stateChangePredicate` catches both.
// Without this the chart keeps rendering the stale profile until re-opened. The
// implementation is lazy-loaded since it pulls in the densification path.
export const trackViewerRefreshElevationChartProcessor: Processor = {
  statePredicate: (state) =>
    Boolean(state.elevationChart.elevationProfilePoints),
  stateChangePredicate: (state) =>
    resolveActiveTrack(
      state.trackViewer.trackGeojson,
      state.trackViewer.selectedTrackIndex,
    )?.feature,
  handle: async (...params) =>
    (
      await import(
        /* webpackChunkName: "track-viewer-refresh-elevation-chart-processor-handler" */
        './trackViewerRefreshElevationChartProcessorHandler.js'
      )
    ).default(...params),
};
