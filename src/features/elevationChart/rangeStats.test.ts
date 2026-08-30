import { describe, expect, it } from 'vitest';
import type { ElevationProfilePoint } from './model/reducer.js';
import { rangeStatsOf } from './rangeStats.js';

// Up 100 m, down 50, up 50 again — so the climb totals differ from the net rise
// and a stretch's own figures cannot be read off its two ends' elevations.
const profile: ElevationProfilePoint[] = [
  { lat: 0, lon: 0, distance: 0, ele: 100, climbUp: 0, climbDown: 0 },
  { lat: 0, lon: 1, distance: 100, ele: 200, climbUp: 100, climbDown: 0 },
  { lat: 0, lon: 2, distance: 200, ele: 150, climbUp: 100, climbDown: 50 },
  { lat: 0, lon: 3, distance: 300, ele: 200, climbUp: 150, climbDown: 50 },
];

describe('rangeStatsOf', () => {
  it('has nothing to say without a stretch, or without a profile', () => {
    expect(rangeStatsOf(profile, null)).toBeNull();

    expect(rangeStatsOf([], { from: 0, to: 100 })).toBeNull();
  });

  it("reports the climb inside the stretch, not the whole line's", () => {
    // The middle stretch descends 50 m and climbs 50 m; the line as a whole
    // climbs 150 m, which is what the difference of the ends must not report.
    expect(rangeStatsOf(profile, { from: 100, to: 300 })).toMatchObject({
      length: 200,
      up: 50,
      down: 50,
    });
  });

  it('takes the climb from interpolated ends, so a stretch inside one segment counts its share', () => {
    expect(rangeStatsOf(profile, { from: 0, to: 50 })).toMatchObject({
      up: 50,
      down: 0,
    });
  });

  it('reports the elevations the stretch runs between, ends included', () => {
    // The low point is an interpolated end, the high one a sample inside.
    expect(rangeStatsOf(profile, { from: 50, to: 250 })).toMatchObject({
      min: 150,
      max: 200,
    });
  });

  it('measures steepness end to end rather than averaging the wiggles', () => {
    // Down 50 then up 50 over 200 m: flat overall, however steep either half.
    expect(rangeStatsOf(profile, { from: 100, to: 300 })?.grade).toBe(0);

    expect(rangeStatsOf(profile, { from: 0, to: 100 })?.grade).toBe(1);
  });

  it('reports no steepness for a stretch of no length', () => {
    expect(rangeStatsOf(profile, { from: 100, to: 100 })?.grade).toBeNaN();
  });

  it('ignores a gap when saying what the stretch runs between', () => {
    const paused: ElevationProfilePoint[] = [
      { lat: 0, lon: 0, distance: 0, ele: 100, climbUp: 0, climbDown: 0 },
      {
        lat: 0,
        lon: 1,
        distance: 100,
        ele: Number.NaN,
        climbUp: 0,
        climbDown: 0,
      },
      { lat: 0, lon: 2, distance: 200, ele: 300, climbUp: 200, climbDown: 0 },
    ];

    expect(rangeStatsOf(paused, { from: 0, to: 200 })).toMatchObject({
      min: 100,
      max: 300,
    });
  });
});
