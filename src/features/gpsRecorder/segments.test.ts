import { describe, expect, it } from 'vitest';
import type { RecorderPoint } from './protocol.js';
import { filterByAccuracy, splitPointsIntoSegments } from './segments.js';

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
  acc: null,
  spd: null,
  brg: null,
  seg: null,
  ...overrides,
});

const seqs = (segments: RecorderPoint[][]) =>
  segments.map((segment) => segment.map((point) => point.seq));

describe('splitPointsIntoSegments', () => {
  it('keeps an uninterrupted track in one segment', () => {
    expect(
      seqs(splitPointsIntoSegments([pt(1), pt(2), pt(3)], [], 60_000)),
    ).toEqual([[1, 2, 3]]);
  });

  it('has no segments for an empty track', () => {
    expect(splitPointsIntoSegments([], [], 60_000)).toEqual([]);
  });

  it('splits on a silence longer than the threshold', () => {
    const points = [pt(1), pt(2), pt(3, { ts: T0 + 200_000 }), pt(4)];

    expect(seqs(splitPointsIntoSegments(points, [], 60_000))).toEqual([
      [1, 2],
      [3, 4],
    ]);
  });

  it('never splits on time when the threshold is zero', () => {
    const points = [pt(1), pt(2, { ts: T0 + 86_400_000 })];

    expect(seqs(splitPointsIntoSegments(points, [], 0))).toEqual([[1, 2]]);
  });

  it('splits after a recorded break the time rule would miss', () => {
    // A pause of one second: only the break marker says the track was cut.
    expect(
      seqs(splitPointsIntoSegments([pt(1), pt(2), pt(3)], [2], 60_000)),
    ).toEqual([[1, 2], [3]]);
  });

  it('ignores a break marker at a seq the track does not hold', () => {
    expect(seqs(splitPointsIntoSegments([pt(1), pt(3)], [2], 60_000))).toEqual([
      [1, 3],
    ]);
  });

  it("splits on the recorder's own segment ordinal", () => {
    const points = [pt(1, { seg: 0 }), pt(2, { seg: 0 }), pt(3, { seg: 1 })];

    expect(seqs(splitPointsIntoSegments(points, [], 0))).toEqual([[1, 2], [3]]);
  });

  it('does not split where only one side reports an ordinal', () => {
    // The column appeared mid-track (a recorder updated between pages), which
    // says nothing about a break.
    const points = [pt(1), pt(2, { seg: 4 })];

    expect(seqs(splitPointsIntoSegments(points, [], 0))).toEqual([[1, 2]]);
  });
});

describe('filterByAccuracy', () => {
  it('keeps everything when there is no limit', () => {
    const points = [pt(1, { acc: 500 }), pt(2, { acc: null })];

    expect(filterByAccuracy(points, null)).toBe(points);
  });

  it('drops fixes worse than the limit, keeping those with none reported', () => {
    const points = [
      pt(1, { acc: 5 }),
      pt(2, { acc: 80 }),
      pt(3, { acc: null }),
      pt(4, { acc: 50 }),
    ];

    expect(filterByAccuracy(points, 50).map((point) => point.seq)).toEqual([
      1, 3, 4,
    ]);
  });
});
