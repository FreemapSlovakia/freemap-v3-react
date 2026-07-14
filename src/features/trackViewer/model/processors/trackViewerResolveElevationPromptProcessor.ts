import { clearMapFeatures } from '@app/store/actions.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { elevationChartSetTrackGeojson } from '@features/elevationChart/model/actions.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import {
  trackViewerColorizeTrackBy,
  trackViewerResolveElevationPrompt,
  trackViewerSetData,
  trackViewerSetElevation,
} from '@features/trackViewer/model/actions.js';
import { trackInfoToast } from '@features/trackViewer/model/trackInfoToast.js';
import { loadTrackViewerMessages } from '@features/trackViewer/translations/loadTrackViewerMessages.js';
import { enrichElevations } from '@shared/elevation.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import {
  isTrackLine,
  resolveActiveTrack,
  trackWaypoints,
} from '../../trackSelection.js';
import { ensureRenderGeojson } from '../ensureRenderGeojson.js';

export const trackViewerResolveElevationPromptProcessor: Processor<
  typeof trackViewerResolveElevationPrompt
> = {
  actionCreator: trackViewerResolveElevationPrompt,
  handle: async ({ dispatch, getState, action }) => {
    const { trackGeojson } = getState().trackViewer;

    if (!trackGeojson) {
      return;
    }

    const lineFeatures = trackGeojson.features.filter(isTrackLine);

    const { mode, consumer } = action.payload;

    // 'keep' uses the recorded elevation as-is; 'missing'/'all' fetch from the
    // server first and cache the result back into trackGeojson so the chart,
    // colorize and export all reuse it.
    let lines = lineFeatures;

    if (mode !== 'keep') {
      lines = await enrichElevations(lineFeatures, mode, getState);

      let i = 0;

      const features = trackGeojson.features.map((f) =>
        isTrackLine(f) ? lines[i++]! : f,
      );

      dispatch(trackViewerSetElevation({ ...trackGeojson, features }));
    }

    if (consumer.type === 'colorize') {
      // The colorize renders from trackGeojson, which the enrich above already
      // refreshed; applying the mode is all that's left.
      dispatch(trackViewerColorizeTrackBy(consumer.mode));

      return;
    }

    if (consumer.type === 'info') {
      // The info panel's stats (ascent, descent, min/max) read the now-filled
      // elevation from trackGeojson.
      dispatch(trackInfoToast);

      return;
    }

    if (consumer.type === 'update') {
      // The explicit "update elevation" action reports the outcome; `keep` never
      // reaches here (the modal hides it for this consumer).
      dispatch(
        toastsAdd({
          id: 'trackViewer.elevationUpdated',
          messageKey: 'elevationFill.updatedToast',
          messageParams: { mode },
          messageLoader: loadTrackViewerMessages,
          cancelType: [clearMapFeatures.type, trackViewerSetData.type],
          timeout: 5000,
          style: 'success',
        }),
      );

      return;
    }

    // Open the chart on the active track, rendering its elevation as-is: 'keep'
    // shows the recorded values with their gaps, while a fill/override has
    // already written the server values into these same coordinates. An
    // override may also densify a sparse line so the profile isn't coarse.
    await ensureRenderGeojson(getState, dispatch);

    const after = getState().trackViewer;

    const active = resolveActiveTrack(
      after.trackGeojson,
      after.selectedTrackIndex,
    );

    const rendered = active && after.renderTrackGeojson?.features[active.index];

    const first =
      rendered && isTrackLine(rendered)
        ? rendered
        : (active?.feature ?? lines[0]);

    if (first) {
      trackMatomo(['trackEvent', 'TrackViewer', 'toggleElevationChart']);

      dispatch(
        elevationChartSetTrackGeojson(
          first,
          true,
          trackWaypoints(after.trackGeojson),
        ),
      );
    }
  },
};
