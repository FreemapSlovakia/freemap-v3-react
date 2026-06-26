import type { Processor } from '@app/store/middleware/processorMiddleware.js';

// Keeps an already-open elevation chart in sync when the loaded track changes —
// e.g. its elevation is refilled from the server (the "update elevation" button,
// or a colorize/info fill that runs while the chart is showing). Without this
// the chart keeps rendering the stale profile until the user re-opens it. The
// implementation is lazy-loaded since it pulls in the densification path.
export const trackViewerRefreshElevationChartProcessor: Processor = {
  statePredicate: (state) =>
    Boolean(state.elevationChart.elevationProfilePoints),
  stateChangePredicate: (state) => state.trackViewer.trackGeojson,
  handle: async (...params) =>
    (
      await import(
        /* webpackChunkName: "track-viewer-refresh-elevation-chart-processor-handler" */
        './trackViewerRefreshElevationChartProcessorHandler.js'
      )
    ).default(...params),
};
