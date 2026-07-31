import { clearMapFeatures } from '@app/store/actions.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import {
  trackViewerColorizeTrackBy,
  trackViewerResolveElevationPrompt,
  trackViewerSetData,
  trackViewerSetElevation,
} from '@features/dataViewer/model/actions.js';
import { trackInfoToast } from '@features/dataViewer/model/trackInfoToast.js';
import { loadDataViewerMessages } from '@features/dataViewer/translations/loadDataViewerMessages.js';
import { elevationChartOpen } from '@features/elevationChart/model/actions.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { enrichElevations } from '@shared/elevation.js';
import { isTrackLine, resolveActiveTrack } from '../../trackSelection.js';

export const dataViewerResolveElevationPromptProcessor: Processor<
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

    // What answered, kept in the slice: this write is the only place the models
    // behind an overridden track are named, and the chart crediting them opens
    // separately.
    const sources = new Set<string>();

    if (mode !== 'keep') {
      lines = await enrichElevations(
        lineFeatures,
        mode,
        getState,
        undefined,
        sources,
      );

      let i = 0;

      const features = trackGeojson.features.map((f) =>
        isTrackLine(f) ? lines[i++]! : f,
      );

      dispatch(
        trackViewerSetElevation({
          trackGeojson: { ...trackGeojson, features },
          sources: [...sources],
        }),
      );
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
          messageLoader: loadDataViewerMessages,
          cancelType: [clearMapFeatures.type, trackViewerSetData.type],
          timeout: 5000,
          style: 'success',
        }),
      );

      return;
    }

    // Claim the chart for the active track, rendering its elevation as-is:
    // 'keep' shows the recorded values with their gaps, while a fill/override
    // has already written the server values into these same coordinates.
    // `elevationChartProcessor` draws it from there (and densifies a sparse
    // line first, so the profile isn't coarse).
    const after = getState().trackViewer;

    if (resolveActiveTrack(after.trackGeojson, after.selectedTrackIndex)) {
      dispatch(elevationChartOpen({ type: 'track-viewer' }));
    }
  },
};
