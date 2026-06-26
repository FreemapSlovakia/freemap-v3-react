import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { trackViewerSetSelectedTrack } from '../actions.js';

// Keeps an already-open elevation chart in sync when the track it shows changes
// — its elevation is refilled from the server (the "update elevation" button, or
// a colorize/info fill while the chart is showing), or the user switches which
// track is active. Triggers cheaply: a new `trackGeojson` reference (the
// elevation refill) or the select-track action. The two fire as an OR, and the
// handler (lazy-loaded; it pulls in the densification path) bails when the chart
// is closed, so an idle action does no work beyond a reference compare.
export const trackViewerRefreshElevationChartProcessor: Processor = {
  predicatesOperation: 'OR',
  actionCreator: trackViewerSetSelectedTrack,
  stateChangePredicate: (state) => state.trackViewer.trackGeojson,
  handle: async (...params) =>
    (
      await import(
        /* webpackChunkName: "track-viewer-refresh-elevation-chart-processor-handler" */
        './trackViewerRefreshElevationChartProcessorHandler.js'
      )
    ).default(...params),
};
