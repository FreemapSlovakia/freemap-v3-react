import type { RootState } from '@app/store/store.js';
import { createSelector } from 'reselect';
import type { RecorderPoint } from '../protocol.js';
import { splitPointsIntoSegments } from '../segments.js';
import {
  foldRecorderStats,
  isFoldCurrent,
  type RecorderStats,
  type RecorderStatsFold,
  recorderStatsOf,
} from '../stats.js';

/**
 * The recording as it is drawn and saved: split into segments at the restarts the
 * recorder marked and at the silences.
 *
 * Imprecise fixes are not dropped here — the recorder applies `maxAccuracyM`
 * itself, as the config it reports back in `/status` confirms, so a second filter
 * would only disagree with the file on disk.
 *
 * Memoized because it runs against the whole track and the track grows once a
 * second — every consumer reads the same computed value per fix rather than
 * repeating it.
 */
export const selectRecorderSegments: (state: RootState) => RecorderPoint[][] =
  createSelector(
    (state: RootState) => state.gpsRecorder.points,
    (state: RootState) => state.gpsRecorderSettings.splitGapS,
    (points, splitGapS) => splitPointsIntoSegments(points, splitGapS * 1000),
  );

/** The newest fix, or null on an empty track. */
export const selectLatestRecorderPoint = createSelector(
  (state: RootState) => state.gpsRecorder.points,
  (points) => points.at(-1) ?? null,
);

/**
 * Builds a selector for the whole track's statistics, advanced by the fixes that
 * arrived since the last read. It returns the same object until something
 * changes, so a component may select it directly.
 *
 * The fold is held in the closure rather than inside a `createSelector` because
 * the whole point is to continue from the previous result, which reselect cannot
 * hand to a recompute. Advancing over one new point is what keeps a long
 * recording cheap; the fold itself checks that the track still starts with what
 * it has already counted, so a cleared or back-filled track is refolded rather
 * than trusted.
 *
 * One instance per store: the fold is a running total, and two stores sharing
 * one would each advance the other's.
 */
export function makeRecorderStatsSelector(): (
  state: RootState,
) => RecorderStats {
  let statsFold: RecorderStatsFold | null = null;

  let stats: RecorderStats | null = null;

  return function selectRecorderStats(state) {
    const { points } = state.gpsRecorder;

    const gapMs = state.gpsRecorderSettings.splitGapS * 1000;

    if (
      stats !== null &&
      statsFold !== null &&
      isFoldCurrent(statsFold, points, gapMs)
    ) {
      return stats;
    }

    statsFold = foldRecorderStats(statsFold, points, gapMs);

    stats = recorderStatsOf(statsFold);

    return stats;
  };
}

export const selectRecorderStats = makeRecorderStatsSelector();
