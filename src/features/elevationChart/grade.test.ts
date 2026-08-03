import { describe, expect, it } from 'vitest';
import { gradeAt, indexOfProfilePoint } from './grade.js';
import type { ElevationProfilePoint } from './model/reducer.js';

const at = (distance: number, lat = 0, lon = 0): ElevationProfilePoint => ({
  lat,
  lon,
  distance,
  ele: 0,
});

const profile = [at(0), at(100), at(250)];

describe('indexOfProfilePoint', () => {
  it('answers -1 on an empty profile', () => {
    expect(indexOfProfilePoint([], at(0))).toBe(-1);
  });

  it('finds the sample nearest along the distance axis', () => {
    expect(indexOfProfilePoint(profile, at(40))).toBe(0);

    expect(indexOfProfilePoint(profile, at(60))).toBe(1);

    expect(indexOfProfilePoint(profile, at(100))).toBe(1);

    expect(indexOfProfilePoint(profile, at(200))).toBe(2);
  });

  it('clamps past either end', () => {
    expect(indexOfProfilePoint(profile, at(-10))).toBe(0);

    expect(indexOfProfilePoint(profile, at(1000))).toBe(2);
  });

  it('takes the earlier sample when two are equally near', () => {
    expect(indexOfProfilePoint(profile, at(50))).toBe(0);
  });

  it('tells a pause’s two ends apart by their position', () => {
    // A pause: the recording stops at one place and resumes at another without
    // travelling, so both ends stand at the same distance.
    const paused = [at(0), at(100, 0, 1), at(100, 0, 2), at(200, 0, 3)];

    expect(indexOfProfilePoint(paused, at(100, 0, 1))).toBe(1);

    expect(indexOfProfilePoint(paused, at(100, 0, 2))).toBe(2);
  });
});

const climbing = (distance: number, ele: number): ElevationProfilePoint => ({
  lat: 0,
  lon: 0,
  distance,
  ele,
});

describe('gradeAt', () => {
  it('measures over a window of the asked-for length', () => {
    const profile = [
      climbing(0, 100),
      climbing(100, 110),
      climbing(200, 190),
      climbing(300, 200),
    ];

    // 100 m either side of the middle: 90 m of rise over 200 m of run.
    expect(gradeAt(profile, 2, 200)).toBeCloseTo(0.45, 10);

    // A window shorter than the point spacing reaches the nearer neighbour
    // only — here the one behind, both being equally far.
    expect(gradeAt(profile, 2, 0)).toBeCloseTo(0.8, 10);
  });

  it('measures between the line’s ends when the window is unbounded', () => {
    const profile = [
      climbing(0, 315),
      climbing(1000, 500),
      climbing(1800, 420),
      climbing(3200, 649),
    ];

    const overall = (649 - 315) / 3200;

    // The whole line, so the same reading wherever the point stands on it —
    // the angle its far end is seen at from its near one.
    for (let i = 0; i < profile.length; i++) {
      expect(gradeAt(profile, i, Number.POSITIVE_INFINITY)).toBeCloseTo(
        overall,
        10,
      );
    }

    expect((Math.atan(overall) * 180) / Math.PI).toBeCloseTo(5.96, 2);
  });

  it('stops an unbounded window at a gap, measuring only its own stretch', () => {
    const profile = [
      climbing(0, 100),
      climbing(500, 200),
      climbing(500, Number.NaN),
      climbing(500, 300),
      climbing(1500, 350),
    ];

    expect(gradeAt(profile, 0, Number.POSITIVE_INFINITY)).toBeCloseTo(0.2, 10);

    expect(gradeAt(profile, 4, Number.POSITIVE_INFINITY)).toBeCloseTo(0.05, 10);

    expect(gradeAt(profile, 2, Number.POSITIVE_INFINITY)).toBeUndefined();
  });
});
