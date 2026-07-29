import type { RootState } from '@app/store/store.js';
import { createSelector } from 'reselect';
import type { RecorderPoint } from '../protocol.js';
import { filterByAccuracy, splitPointsIntoSegments } from '../segments.js';

/**
 * The accuracy limit this app has to apply itself: none when the recorder is
 * already dropping imprecise fixes for us, which its reported `config` is the
 * only way to know (an older build ignores the `POST /start` body entirely).
 */
const selectClientAccuracyLimit = (state: RootState): number | null =>
  state.gpsRecorder.status?.config
    ? null
    : state.gpsRecorderSettings.maxAccuracyM;

/**
 * The recording as it is drawn, measured and saved: imprecise fixes dropped,
 * then split into segments at the pauses, restarts and silences.
 *
 * Memoized because it runs against the whole track and the track grows once a
 * second — every consumer reads the same computed value per fix rather than
 * repeating it.
 */
export const selectRecorderSegments: (state: RootState) => RecorderPoint[][] =
  createSelector(
    (state: RootState) => state.gpsRecorder.points,
    (state: RootState) => state.gpsRecorder.breaks,
    (state: RootState) => state.gpsRecorderSettings.splitGapS,
    selectClientAccuracyLimit,
    (points, breaks, splitGapS, maxAccuracyM) =>
      splitPointsIntoSegments(
        filterByAccuracy(points, maxAccuracyM),
        breaks,
        splitGapS * 1000,
      ),
  );

/** The newest fix that survived the accuracy filter, or null on an empty track. */
export const selectLatestRecorderPoint = createSelector(
  selectRecorderSegments,
  (segments) => segments.at(-1)?.at(-1) ?? null,
);
