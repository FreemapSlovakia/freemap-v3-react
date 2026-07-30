import { clearMapFeatures } from '@app/store/actions.js';
import { createReducer } from '@reduxjs/toolkit';
import type { RecorderPoint, RecorderStatus } from '../protocol.js';
import {
  type GpsRecorderConnection,
  type GpsRecorderFailure,
  gpsRecorderAddBreak,
  gpsRecorderAddPoints,
  gpsRecorderSetConnection,
  gpsRecorderSetError,
  gpsRecorderSetPaused,
  gpsRecorderSetPending,
  gpsRecorderSetStatus,
  gpsRecorderStop,
  gpsRecorderTrackCleared,
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
  /**
   * Seqs of the last point before each break this app caused by pausing or
   * stopping. Feeds `splitPointsIntoSegments` alongside the time-gap rule, so a
   * pause shorter than the gap threshold still splits the track.
   */
  breaks: number[];
  /**
   * Whether the session is only suspended. Follows `status.paused` when the
   * recorder reports it, and otherwise remembers the pause this app faked with a
   * stop — so a recorder without `/pause` reads the same to the rest of the app.
   */
  paused: boolean;
  /**
   * Whether a transport command the user gave is still in flight, so the
   * controls can wait for it without the background poll's own connecting
   * phases disabling them.
   */
  pending: boolean;
  /**
   * The recorder's `generation` as of the last status seen — how many times its
   * track has been thrown away. A change means the points held here are gone.
   * Null before any status has been read.
   */
  generation: number | null;
  connection: GpsRecorderConnection;
  error: GpsRecorderFailure | null;
}

export const gpsRecorderInitialState: GpsRecorderState = {
  status: null,
  points: [],
  cursor: 0,
  breaks: [],
  paused: false,
  pending: false,
  generation: null,
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
        breaks: [],
      }))
      // The recorder's own track is gone, so the copy of it goes too. Applied
      // only once the delete has been acknowledged, never optimistically.
      .addCase(gpsRecorderTrackCleared, (state) => ({
        ...state,
        points: [],
        cursor: 0,
        breaks: [],
      }))
      .addCase(gpsRecorderSetStatus, (state, { payload }) => ({
        ...state,
        status: payload,
        generation: payload?.generation ?? state.generation,
        // The recorder's own answer wins when it has one: `recording` stays true
        // across a pause there, so `paused` is the only thing that says which of
        // the two live states this is. A recorder without `/pause` reports none,
        // and then the local flag — set when the pause was faked with a stop —
        // is all there is.
        paused:
          typeof payload?.paused === 'boolean' ? payload.paused : state.paused,
      }))
      .addCase(gpsRecorderAddPoints, (state, { payload }) => {
        const points = mergePoints(state.points, payload);

        return {
          ...state,
          points,
          cursor: points.length === 0 ? 0 : points.at(-1)!.seq,
        };
      })
      .addCase(gpsRecorderAddBreak, (state, { payload }) =>
        // A break at the same seq twice — two stops with no fix between them —
        // is the same break, and an empty track has nothing to break after.
        payload <= 0 || state.breaks.includes(payload)
          ? state
          : { ...state, breaks: [...state.breaks, payload] },
      )
      .addCase(gpsRecorderSetPaused, (state, { payload }) => ({
        ...state,
        paused: payload,
      }))
      .addCase(gpsRecorderSetPending, (state, { payload }) => ({
        ...state,
        pending: payload,
      }))
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
