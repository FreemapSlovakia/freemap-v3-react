import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import type { RootState } from '@app/store/store.js';
import { buildLines, needsBuild, publish, shownLines } from '../renderLines.js';

/** Edits come in runs (draw clicks, a drag's moves): fetch once they settle. */
const SETTLE_MS = 400;

let timer: ReturnType<typeof setTimeout> | undefined;

let seen: unknown[] = [];

/** What the render copy is derived from; anything else leaves it as it is. */
const inputs = (state: RootState) => [
  state.trackViewer.trackGeojson,
  state.trackViewer.renderTrackGeojson,
  state.trackViewer.elevationDecision,
  state.elevationSettings,
  state.trackViewerSettings.colorizeTrackBy,
  state.trackViewer.activeTrackIndex,
  state.elevationChart.target,
  state.toasts.toasts,
];

/**
 * Keeps `renderTrackGeojson` in step with the lines (see `renderLines.ts`): at
 * once from what is already built, so an edit never blanks the lines it left
 * alone, and — once edits settle — fetching what the shown lines still lack.
 */
export const dataViewerRenderProcessor: Processor = {
  handle: ({ getState, dispatch }) => {
    const state = getState();

    const now = inputs(state);

    if (now.every((value, i) => value === seen[i])) {
      return;
    }

    seen = now;

    publish(getState, dispatch);

    const { trackGeojson, elevationDecision } = getState().trackViewer;

    const missing = shownLines(getState()).filter((i) =>
      needsBuild(trackGeojson!.features[i]!, elevationDecision),
    );

    // A drag's every move restarts the wait, so it fetches once it stops.
    clearTimeout(timer);

    if (missing.length === 0) {
      return;
    }

    timer = setTimeout(() => {
      buildLines(getState, dispatch, shownLines(getState())).catch((err) => {
        console.warn('Sampling elevation for the map failed:', err);
      });
    }, SETTLE_MS);
  },
};
