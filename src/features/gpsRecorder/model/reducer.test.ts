import { clearMapFeatures } from '@app/store/actions.js';
import { describe, expect, it } from 'vitest';
import type { RecorderPoint } from '../protocol.js';
import { gpsRecorderAddPoints, gpsRecorderTrackCleared } from './actions.js';
import {
  gpsRecorderInitialState,
  gpsRecorderReducer,
  mergePoints,
} from './reducer.js';

const pt = (seq: number): RecorderPoint => ({
  seq,
  ts: 1_700_000_000_000 + seq * 1000,
  lat: 48 + seq / 1000,
  lon: 17 + seq / 1000,
  alt: null,
  acc: null,
  spd: null,
  brg: null,
});

const seqs = (points: RecorderPoint[]) => points.map((point) => point.seq);

describe('mergePoints', () => {
  it('appends a batch that follows the held track', () => {
    expect(seqs(mergePoints([pt(1), pt(2)], [pt(3), pt(4)]))).toEqual([
      1, 2, 3, 4,
    ]);
  });

  it('orders an out-of-order batch', () => {
    expect(seqs(mergePoints([pt(1)], [pt(3), pt(2)]))).toEqual([1, 2, 3]);
  });

  it('drops seqs already held', () => {
    expect(seqs(mergePoints([pt(1), pt(2)], [pt(2), pt(3)]))).toEqual([
      1, 2, 3,
    ]);
  });

  it('fills a gap left behind by the stream', () => {
    // The page was frozen, so the stream jumped to 5 and the later catch-up
    // brings 2..4 in below the cursor.
    expect(seqs(mergePoints([pt(1), pt(5)], [pt(2), pt(3), pt(4)]))).toEqual([
      1, 2, 3, 4, 5,
    ]);
  });

  it('keeps the same array when there is nothing to add', () => {
    const current = [pt(1)];

    expect(mergePoints(current, [])).toBe(current);
  });
});

describe('gpsRecorderReducer', () => {
  it('tracks the cursor as the highest held seq', () => {
    const state = gpsRecorderReducer(
      gpsRecorderInitialState,
      gpsRecorderAddPoints([pt(4), pt(7)]),
    );

    expect(state.cursor).toBe(7);

    // A late catch-up below the cursor must not move it backwards.
    expect(
      gpsRecorderReducer(state, gpsRecorderAddPoints([pt(5)])).cursor,
    ).toBe(7);
  });

  it('rewinds the cursor once the recorder confirms the delete', () => {
    const state = gpsRecorderReducer(
      gpsRecorderInitialState,
      gpsRecorderAddPoints([pt(1), pt(2)]),
    );

    const cleared = gpsRecorderReducer(state, gpsRecorderTrackCleared());

    expect(cleared.points).toEqual([]);
    expect(cleared.cursor).toBe(0);
  });

  it('rewinds the cursor when the local copy is cleared', () => {
    const state = gpsRecorderReducer(
      gpsRecorderInitialState,
      gpsRecorderAddPoints([pt(1), pt(2)]),
    );

    const cleared = gpsRecorderReducer(state, clearMapFeatures());

    expect(cleared.points).toEqual([]);

    // Zero, so the next sync refetches the whole track from the recorder.
    expect(cleared.cursor).toBe(0);
  });
});
