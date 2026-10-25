import { clearMapFeatures } from '@app/store/actions.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import {
  dataViewerColorizeTrackBy,
  dataViewerResolveElevationPrompt,
  dataViewerSetData,
  dataViewerSetElevation,
} from '@features/dataViewer/model/actions.js';
import { trackInfoToast } from '@features/dataViewer/model/trackInfoToast.js';
import { loadDataViewerMessages } from '@features/dataViewer/translations/loadDataViewerMessages.js';
import { elevationChartOpen } from '@features/elevationChart/model/actions.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import {
  creditedAttributions,
  enrichElevations,
  fetchElevations,
  mergeAttributions,
  newElevationCredits,
} from '@shared/elevation.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import type { Feature, LineString, Point } from 'geojson';
import { isRecording } from '../../trackChannels.js';
import { isTrackLine, resolveActiveTrack } from '../../trackSelection.js';
import { elevationTargets, withoutElevation } from '../elevationTargets.js';
import { markOverridden } from '../renderLines.js';

export const dataViewerResolveElevationPromptProcessor: Processor<
  typeof dataViewerResolveElevationPrompt
> = {
  actionCreator: dataViewerResolveElevationPrompt,
  handle: async ({ dispatch, getState, action }) => {
    const { trackGeojson } = getState().trackViewer;

    if (!trackGeojson) {
      return;
    }

    const { mode, consumer } = action.payload;

    if (consumer.type === 'update') {
      trackMatomo([
        'trackEvent',
        'DataViewer',
        'updateElevation',
        consumer.index === undefined ? mode : `${mode}-feature`,
      ]);
    }

    // The update fills points too, and may be of one feature; the others are
    // about the lines.
    const { lines: lineAt, points: pointAt } =
      consumer.type === 'update'
        ? elevationTargets(trackGeojson, consumer.index)
        : {
            lines: trackGeojson.features.flatMap((f, i) =>
              isTrackLine(f) ? [i] : [],
            ),
            points: [],
          };

    // What answered, kept in the slice: this write is the only place the models
    // behind an overridden track are named, and the chart crediting them opens
    // separately.
    const credits = newElevationCredits();

    const single = consumer.type === 'update' && consumer.index !== undefined;

    if (mode === 'clear') {
      const targets = new Set([...lineAt, ...pointAt]);

      dispatch(
        dataViewerSetElevation({
          trackGeojson: {
            ...trackGeojson,
            features: trackGeojson.features.map((f, i) =>
              targets.has(i) ? withoutElevation(f) : f,
            ),
          },
          // Nothing left for the models to answer for, unless others still hold
          // what they gave.
          attributions: single
            ? getState().trackViewer.elevationAttributions
            : [],
        }),
      );
    }

    // 'keep' uses the recorded elevation as-is; 'missing'/'all' fetch from the
    // server first and cache the result back into trackGeojson so the chart,
    // colorize and export all reuse it.
    if (mode === 'missing' || mode === 'all') {
      const { features } = trackGeojson;

      const lines = await enrichElevations(
        lineAt.map((i) => features[i] as Feature<LineString>),
        mode,
        getState,
        undefined,
        credits,
      );

      const pending = pointAt.filter(
        (i) =>
          mode === 'all' ||
          (features[i] as Feature<Point>).geometry.coordinates.length < 3,
      );

      const position = (i: number) =>
        (features[i] as Feature<Point>).geometry.coordinates;

      const eles = await fetchElevations(
        pending.map((i) => [position(i)[1]!, position(i)[0]!]),
        getState,
        undefined,
        credits,
      );

      // Edited while the fetch ran: writing this back would undo the edit.
      if (getState().trackViewer.trackGeojson !== trackGeojson) {
        return;
      }

      const updated = new Map<number, Feature>(
        lineAt.map((at, i) => [at, lines[i]!]),
      );

      for (const [k, at] of pending.entries()) {
        const ele = eles[k];

        if (ele != null) {
          const [lon, lat] = position(at);

          updated.set(at, {
            ...features[at]!,
            geometry: { type: 'Point', coordinates: [lon!, lat!, ele] },
          });
        }
      }

      // One recording overridden alone is drawn as the collection's would be.
      if (single && mode === 'all') {
        for (const line of lines.filter(isRecording)) {
          markOverridden(line.geometry);
        }
      }

      const { elevationAttributions } = getState().trackViewer;

      dispatch(
        dataViewerSetElevation({
          trackGeojson: {
            ...trackGeojson,
            features: features.map((f, i) => updated.get(i) ?? f),
          },
          // One feature's update adds its models to those already credited.
          attributions: single
            ? mergeAttributions(
                elevationAttributions,
                creditedAttributions(credits),
              )
            : creditedAttributions(credits),
        }),
      );
    }

    if (consumer.type === 'colorize') {
      // The colorize renders from trackGeojson, which the enrich above already
      // refreshed; applying the mode is all that's left.
      dispatch(dataViewerColorizeTrackBy(consumer.mode));

      return;
    }

    if (consumer.type === 'info') {
      // The info panel's stats (ascent, descent, min/max) read the now-filled
      // elevation, densified where the render copy does.
      dispatch(trackInfoToast);

      return;
    }

    if (consumer.type === 'update') {
      // The explicit "update elevation" action reports the outcome; `keep` never
      // reaches here (the modal hides it for this consumer).
      dispatch(
        toastsAdd({
          id: 'dataViewer.elevationUpdated',
          messageKey: 'elevationFill.updatedToast',
          messageParams: { mode },
          messageLoader: loadDataViewerMessages,
          cancelType: [clearMapFeatures.type, dataViewerSetData.type],
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

    if (resolveActiveTrack(after.trackGeojson, after.activeTrackIndex)) {
      dispatch(elevationChartOpen({ type: 'track-viewer' }));
    }
  },
};
