import { HttpError, httpRequest } from '@app/httpRequest.js';
import { selectFeature } from '@app/store/actions.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import {
  asRecordedPart,
  isMatchable,
  MATCH_ACCURACY,
  MATCH_MAX_BYTES,
  MATCH_MAX_LENGTH_RATIO,
  type MatchedPart,
  matchedSegment,
  matchedTrack,
  segmentToGpx,
  trackSegments,
} from '@features/dataViewer/matchTrack.js';
import {
  dataViewerMatchTrack,
  dataViewerSetData,
} from '@features/dataViewer/model/actions.js';
import { resolveActiveTrack } from '@features/dataViewer/trackSelection.js';
import { loadDataViewerMessages } from '@features/dataViewer/translations/loadDataViewerMessages.js';
import { graphhopperMatchUrl } from '@features/routePlanner/model/graphhopperRoute.js';
import { pathDetailKeys } from '@features/routePlanner/model/pathDetails.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { transportTypeDefs } from '@shared/transportTypeDefs.js';

/**
 * GraphHopper reports a segment it cannot route through as a Java exception
 * naming the time step it gave up at.
 */
const BROKEN_AT = /at time step (\d+)/;

export const dataViewerMatchTrackProcessor: Processor<
  typeof dataViewerMatchTrack
> = {
  actionCreator: dataViewerMatchTrack,
  handle: async ({ dispatch, getState, action, toastError }) => {
    const { transport } = action.payload;

    const { trackGeojson, activeTrackIndex } = getState().trackViewer;

    const active = resolveActiveTrack(trackGeojson, activeTrackIndex);

    const def = transportTypeDefs[transport];

    if (!trackGeojson || !active || def.api !== 'gh') {
      return;
    }

    const url =
      `${graphhopperMatchUrl()}?` +
      new URLSearchParams([
        ['profile', def.profile],
        ['points_encoded', 'false'],
        ['elevation', 'true'],
        ['instructions', 'false'],
        ['gps_accuracy', String(MATCH_ACCURACY)],
        ...pathDetailKeys(transport).map(
          (key) => ['details', key] as [string, string],
        ),
      ]);

    const parts: MatchedPart[] = [];

    let attempted = 0;

    let matchedTotal = 0;

    let broken = 0;

    try {
      // One request per segment — see `trackSegments`.
      for (const segment of trackSegments(active.feature)) {
        if (!isMatchable(segment)) {
          parts.push(asRecordedPart(segment));

          continue;
        }

        const gpx = segmentToGpx(segment);

        if (new Blob([gpx]).size > MATCH_MAX_BYTES) {
          dispatch(
            toastsAdd({
              messageKey: 'match.tooLong',
              messageLoader: loadDataViewerMessages,
              style: 'danger',
            }),
          );

          return;
        }

        let raw: unknown;

        try {
          const response = await httpRequest({
            getState,
            method: 'POST',
            url,
            headers: { 'Content-Type': 'application/gpx+xml' },
            body: gpx,
            expectedStatus: 200,
          });

          raw = await response.json();
        } catch (err) {
          // One leg of a mixed track routinely defeats the profile the other
          // needs, so that segment is kept as recorded. Anything else stops all.
          if (!(err instanceof HttpError) || !BROKEN_AT.test(err.body)) {
            throw err;
          }

          broken++;

          parts.push(asRecordedPart(segment));

          continue;
        }

        const matched = matchedSegment(raw);

        attempted += segment.length;

        matchedTotal += matched.length;

        parts.push({
          coordinates: matched.coordinates,
          channels: null,
          details: matched.details,
        });
      }
    } catch (err) {
      // Skips an abort: clearing the map cancels the request, and that is the
      // reader's own doing.
      await toastError(err, loadDataViewerMessages, 'matchingError');

      return;
    }

    if (attempted === 0) {
      dispatch(
        toastsAdd({
          // Nothing was sent at all when no segment was long enough to be worth
          // it, which is a different thing from the graph refusing one.
          messageKey: broken > 0 ? 'match.brokenSequence' : 'match.tooShort',
          messageLoader: loadDataViewerMessages,
          style: 'danger',
        }),
      );

      return;
    }

    // Judged on the segments actually matched, so one left as recorded — which
    // is unchanged by definition — doesn't skew it.
    if (matchedTotal > attempted * MATCH_MAX_LENGTH_RATIO) {
      dispatch(
        toastsAdd({
          messageKey: 'match.offNetwork',
          messageLoader: loadDataViewerMessages,
          style: 'danger',
        }),
      );

      return;
    }

    // The track may have been replaced while the segments were in flight —
    // another file dropped on the map, the recorder appending, an elevation
    // refill — and none of those cancel this run. Writing the captured copy
    // back would silently undo them.
    const current = getState().trackViewer.trackGeojson;

    if (current !== trackGeojson) {
      return;
    }

    if (broken > 0) {
      dispatch(
        toastsAdd({
          messageKey: 'match.partial',
          messageLoader: loadDataViewerMessages,
          style: 'warning',
        }),
      );
    }

    // The recording stays one feature, with one geometry part per segment.
    const matched = matchedTrack(parts, active.feature);

    dispatch(
      dataViewerSetData({
        trackGeojson: {
          ...trackGeojson,
          features: trackGeojson.features.map((feature, i) =>
            i === active.index ? matched : feature,
          ),
        },
      }),
    );

    // Loading data drops the selection; the matched track sits at the original's
    // index, so reselect it to keep the toolbar on it.
    dispatch(selectFeature({ type: 'data-viewer', id: active.index }));
  },
};
