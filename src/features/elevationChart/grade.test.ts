import { describe, expect, it } from 'vitest';
import { indexOfProfilePoint } from './grade.js';
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
