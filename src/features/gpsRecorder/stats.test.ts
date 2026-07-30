import { describe, expect, it } from 'vitest';
import type { RecorderPoint } from './protocol.js';
import {
  computeRecorderStats,
  foldRecorderStats,
  recorderStatsOf,
} from './stats.js';

const T0 = 1_700_000_000_000;

const GAP_MS = 60_000;

const pt = (
  seq: number,
  overrides: Partial<RecorderPoint> = {},
): RecorderPoint => ({
  seq,
  ts: T0 + seq * 1000,
  lat: 48,
  lon: 17,
  alt: null,
  altMsl: null,
  acc: null,
  spd: null,
  brg: null,
  seg: 0,
  ...overrides,
});

describe('computeRecorderStats', () => {
  it('reports nothing for an empty recording', () => {
    const stats = computeRecorderStats([], GAP_MS);

    expect(stats.distance).toBe(0);

    expect(stats.duration).toBe(0);

    expect(stats.points).toBe(0);

    expect(stats.segments).toBe(0);

    expect(stats.averageSpeed).toBeNull();
  });

  it('measures along the ground, not across a break', () => {
    // Two 1000 m legs a kilometre apart, in segments the recorder marked: only
    // the legs count.
    const leg = (base: number, seq: number, seg: number) => [
      pt(seq, { lat: 48 + base, lon: 17, seg }),
      pt(seq + 1, { lat: 48 + base + 0.009, lon: 17, seg }),
    ];

    const stats = computeRecorderStats(
      [...leg(0, 1, 0), ...leg(0.05, 3, 1)],
      GAP_MS,
    );

    expect(stats.distance).toBeGreaterThan(1900);

    expect(stats.distance).toBeLessThan(2100);

    expect(stats.segments).toBe(2);

    expect(stats.points).toBe(4);
  });

  it('counts the break in the duration but not in the recorded time', () => {
    const stats = computeRecorderStats(
      [
        pt(1),
        pt(2),
        pt(3, { ts: T0 + 600_000, seg: 1 }),
        pt(4, { ts: T0 + 601_000, seg: 1 }),
      ],
      GAP_MS,
    );

    expect(stats.duration).toBe(600_000);

    expect(stats.recordedDuration).toBe(2000);
  });

  it('ignores altitude wander below the noise floor', () => {
    const wander = [100, 103, 99, 102, 100].map((alt, i) => pt(i + 1, { alt }));

    expect(computeRecorderStats(wander, GAP_MS).ascent).toBe(0);
  });

  it('counts a climb that clears the noise floor', () => {
    const climb = [100, 120, 140].map((alt, i) => pt(i + 1, { alt }));

    expect(computeRecorderStats(climb, GAP_MS).ascent).toBe(40);
  });

  it('takes the speed of the newest fix', () => {
    const stats = computeRecorderStats(
      [pt(1, { spd: 3 }), pt(2, { spd: 5 })],
      GAP_MS,
    );

    expect(stats.speed).toBe(5);
  });
});

describe('foldRecorderStats', () => {
  // The track as it actually arrives: a leg, a break the recorder marked, a
  // second leg, with altitudes that both wander and climb.
  const track: RecorderPoint[] = [
    pt(1, { alt: 100, spd: 1 }),
    pt(2, { lat: 48.001, alt: 103, spd: 2 }),
    pt(3, { lat: 48.002, alt: 99, spd: 2 }),
    pt(4, { lat: 48.05, ts: T0 + 600_000, alt: 140, spd: 3, seg: 1 }),
    pt(5, { lat: 48.051, ts: T0 + 601_000, alt: 160, spd: 4, seg: 1 }),
    pt(6, { lat: 48.052, ts: T0 + 602_000, alt: 161, spd: 5, seg: 1 }),
  ];

  it('reaches the same figures a fix at a time as in one pass', () => {
    let fold = foldRecorderStats(null, [], GAP_MS);

    for (let i = 1; i <= track.length; i++) {
      fold = foldRecorderStats(fold, track.slice(0, i), GAP_MS);
    }

    expect(recorderStatsOf(fold)).toEqual(computeRecorderStats(track, GAP_MS));
  });

  it('advances only over what is new', () => {
    const fold = foldRecorderStats(null, track.slice(0, 4), GAP_MS);

    const advanced = foldRecorderStats(fold, track, GAP_MS);

    expect(advanced.count).toBe(6);

    // The fold it was given is untouched, so a caller holding it is not
    // surprised by a value that moved under them.
    expect(fold.count).toBe(4);
  });

  it('refolds when the track no longer starts with what it counted', () => {
    const fold = foldRecorderStats(null, track, GAP_MS);

    // What `DELETE /track` leaves behind.
    expect(foldRecorderStats(fold, [], GAP_MS).count).toBe(0);

    // A track re-fetched from zero under a new generation: same length, but the
    // seqs it holds are not the ones already folded.
    const other = track.map((point) => ({ ...point, seq: point.seq + 1000 }));

    expect(foldRecorderStats(fold, other, GAP_MS).lastSeq).toBe(1006);
  });

  it('refolds when the gap threshold changes', () => {
    // A silence the recorder did not mark as a break — it kept recording, the
    // fixes simply stopped arriving — so the threshold alone decides.
    const silent = [
      pt(1),
      pt(2, { lat: 48.001 }),
      pt(3, { lat: 48.05, ts: T0 + 600_000 }),
    ];

    const strict = foldRecorderStats(null, silent, GAP_MS);

    expect(strict.segments).toBe(2);

    // Relaxed past the silence, the same points are one segment, and the leg
    // across the gap now counts towards the distance.
    const relaxed = foldRecorderStats(strict, silent, 3_600_000);

    expect(relaxed.segments).toBe(1);

    expect(relaxed.distance).toBeGreaterThan(strict.distance);
  });
});
