import { clearMapFeatures } from '@app/store/actions.js';
import { createReducer } from '@reduxjs/toolkit';
import type { RecorderPoint, RecorderStatus } from '../protocol.js';
import {
  type GpsRecorderConnection,
  gpsRecorderAddPoints,
  gpsRecorderSetConnection,
  gpsRecorderSetError,
  gpsRecorderSetStatus,
  gpsRecorderStop,
} from './actions.js';

export interface GpsRecorderState {
  status: RecorderStatus | null;
  /** The recorder's points as far as they are known here, ordered by `seq`. */
  points: RecorderPoint[];
  /**
   * Highest `seq` held, i.e. the `/track?since=` cursor.
   *
   * Deliberately not persisted: `statePersistingMiddleware` re-serializes the
   * whole persisted subset on every action, so a persisted cursor would cost a
   * full `JSON.stringify` per incoming fix. A cold start has no points anyway
   * and refetches the track from the recorder, which owns it.
   */
  cursor: number;
  connection: GpsRecorderConnection;
  error: string | null;
}

export const gpsRecorderInitialState: GpsRecorderState = {
  status: null,
  points: [],
  cursor: 0,
  connection: 'idle',
  error: null,
};

/**
 * Merges a batch into a `seq`-ordered list, dropping seqs already held.
 *
 * Catch-up and the stream overlap by design — a resume refetches from the
 * cursor while the reconnected stream replays from its Last-Event-ID — so
 * batches arrive duplicated and, briefly, out of order.
 */
export function mergePoints(
  current: RecorderPoint[],
  incoming: RecorderPoint[],
): RecorderPoint[] {
  if (incoming.length === 0) {
    return current;
  }

  const maxSeq = current.length === 0 ? -Infinity : current.at(-1)!.seq;

  // The hot path: the stream feeding fixes onto the end of the track. Only the
  // batch needs ordering — re-sorting the whole track per fix would be
  // quadratic over a long recording.
  if (incoming.every((point) => point.seq > maxSeq)) {
    return [...current, ...[...incoming].sort((a, b) => a.seq - b.seq)];
  }

  const bySeq = new Map(current.map((point) => [point.seq, point]));

  for (const point of incoming) {
    if (!bySeq.has(point.seq)) {
      bySeq.set(point.seq, point);
    }
  }

  return [...bySeq.values()].sort((a, b) => a.seq - b.seq);
}

export const gpsRecorderReducer = createReducer(
  gpsRecorderInitialState,
  (builder) =>
    builder
      // Drops only this local copy of the track. The recorder keeps its own and
      // is never told to discard anything; the next sync refetches from zero.
      .addCase(clearMapFeatures, (state) => ({
        ...state,
        points: [],
        cursor: 0,
      }))
      .addCase(gpsRecorderSetStatus, (state, { payload }) => ({
        ...state,
        status: payload,
      }))
      .addCase(gpsRecorderAddPoints, (state, { payload }) => {
        const points = mergePoints(state.points, payload);

        return {
          ...state,
          points,
          cursor: points.length === 0 ? 0 : points.at(-1)!.seq,
        };
      })
      .addCase(gpsRecorderSetConnection, (state, { payload }) => ({
        ...state,
        connection: payload,
      }))
      .addCase(gpsRecorderSetError, (state, { payload }) => ({
        ...state,
        error: payload,
      }))
      .addCase(gpsRecorderStop, (state) => ({
        ...state,
        error: null,
      })),
);
