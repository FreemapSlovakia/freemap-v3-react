import { describe, expect, it } from 'vitest';
import type { RecorderPoint } from './protocol.js';
import { splitPointsIntoSegments } from './segments.js';

const T0 = 1_700_000_000_000;

const pt = (
  seq: number,
  overrides: Partial<RecorderPoint> = {},
): RecorderPoint => ({
  seq,
  ts: T0 + seq * 1000,
  lat: 48 + seq / 10000,
  lon: 17 + seq / 10000,
  alt: null,
  altMsl: null,
  acc: null,
  spd: null,
  brg: null,
  sat: null,
  seg: 0,
  ...overrides,
});

const seqs = (segments: RecorderPoint[][]) =>
  segments.map((segment) => segment.map((point) => point.seq));

describe('splitPointsIntoSegments', () => {
  it('keeps an uninterrupted track in one segment', () => {
    expect(
      seqs(splitPointsIntoSegments([pt(1), pt(2), pt(3)], 60_000)),
    ).toEqual([[1, 2, 3]]);
  });

  it('has no segments for an empty track', () => {
    expect(splitPointsIntoSegments([], 60_000)).toEqual([]);
  });

  it('splits on a silence longer than the threshold', () => {
    const points = [pt(1), pt(2), pt(3, { ts: T0 + 200_000 }), pt(4)];

    expect(seqs(splitPointsIntoSegments(points, 60_000))).toEqual([
      [1, 2],
      [3, 4],
    ]);
  });

  it('never splits on time when the threshold is zero', () => {
    const points = [pt(1), pt(2, { ts: T0 + 86_400_000 })];

    expect(seqs(splitPointsIntoSegments(points, 0))).toEqual([[1, 2]]);
  });

  it("splits on the recorder's own segment ordinal", () => {
    // A stop and a restart one second apart: only the ordinal says the track was
    // cut, which is why the recorder is the authority on it.
    const points = [pt(1, { seg: 0 }), pt(2, { seg: 0 }), pt(3, { seg: 1 })];

    expect(seqs(splitPointsIntoSegments(points, 0))).toEqual([[1, 2], [3]]);
  });
});
