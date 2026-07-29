import { describe, expect, it } from 'vitest';
import type { RecorderPoint } from './protocol.js';
import { computeRecorderStats } from './stats.js';

const T0 = 1_700_000_000_000;

const pt = (
  seq: number,
  overrides: Partial<RecorderPoint> = {},
): RecorderPoint => ({
  seq,
  ts: T0 + seq * 1000,
  lat: 48,
  lon: 17,
  alt: null,
  acc: null,
  spd: null,
  brg: null,
  seg: null,
  ...overrides,
});

describe('computeRecorderStats', () => {
  it('reports nothing for an empty recording', () => {
    const stats = computeRecorderStats([]);

    expect(stats.distance).toBe(0);

    expect(stats.duration).toBe(0);

    expect(stats.points).toBe(0);

    expect(stats.averageSpeed).toBeNull();
  });

  it('measures along the ground, not across a break', () => {
    // Two 1000 m legs a kilometre apart: only the legs count.
    const leg = (base: number, seq: number) => [
      pt(seq, { lat: 48 + base, lon: 17 }),
      pt(seq + 1, { lat: 48 + base + 0.009, lon: 17 }),
    ];

    const stats = computeRecorderStats([leg(0, 1), leg(0.05, 3)]);

    expect(stats.distance).toBeGreaterThan(1900);

    expect(stats.distance).toBeLessThan(2100);

    expect(stats.segments).toBe(2);

    expect(stats.points).toBe(4);
  });

  it('counts the break in the duration but not in the recorded time', () => {
    const stats = computeRecorderStats([
      [pt(1), pt(2)],
      [pt(3, { ts: T0 + 600_000 }), pt(4, { ts: T0 + 601_000 })],
    ]);

    expect(stats.duration).toBe(600_000);

    expect(stats.recordedDuration).toBe(2000);
  });

  it('ignores altitude wander below the noise floor', () => {
    const wander = [100, 103, 99, 102, 100].map((alt, i) => pt(i + 1, { alt }));

    expect(computeRecorderStats([wander]).ascent).toBe(0);
  });

  it('counts a climb that clears the noise floor', () => {
    const climb = [100, 120, 140].map((alt, i) => pt(i + 1, { alt }));

    expect(computeRecorderStats([climb]).ascent).toBe(40);
  });

  it('takes the speed of the newest fix', () => {
    const stats = computeRecorderStats([
      [pt(1, { spd: 3 }), pt(2, { spd: 5 })],
    ]);

    expect(stats.speed).toBe(5);
  });
});
