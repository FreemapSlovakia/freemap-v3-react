import { describe, expect, it } from 'vitest';
import { clampPanoramaAzimuth, columnAt, groundElevation } from './ray.js';

/** A frame whose top row looks 10° up, a tenth of a degree per row. */
const render = {
  altMax: 10,
  stepDeg: 0.1,
  eyeElevation: 1000,
  depthLift: 0,
  rangeM: 300_000,
};

/** A full turn at a tenth of a degree a column, and a 90° slice facing north. */
const turn = { azStart: 0, stepDeg: 0.1, width: 3600, fov: 360 };

const slice = { azStart: 315, stepDeg: 0.1, width: 900, fov: 90 };

describe('columnAt', () => {
  it('wraps a full turn', () => {
    expect(columnAt(turn, 90)).toBe(900);

    expect(columnAt(turn, -90)).toBe(2700);
  });

  it('reads across a slice that straddles north', () => {
    expect(columnAt(slice, 315)).toBe(0);

    expect(columnAt(slice, 0)).toBeCloseTo(450, 6);

    expect(columnAt(slice, 44.9)).toBeCloseTo(899, 6);
  });

  it('answers nothing off either end of a slice, rather than wrapping', () => {
    expect(columnAt(slice, 314)).toBeNull();

    expect(columnAt(slice, 45)).toBeNull();

    expect(columnAt(slice, 180)).toBeNull();
  });
});

describe('clampPanoramaAzimuth', () => {
  it('leaves a full turn alone', () => {
    expect(clampPanoramaAzimuth(turn, 200, 30)).toBe(200);

    expect(clampPanoramaAzimuth(turn, -10, 30)).toBe(350);
  });

  it('keeps a slice filled, half the viewport in from each end', () => {
    // A 30° panel over the 90° slice from 315° leaves 330°…30° to look at.
    expect(clampPanoramaAzimuth(slice, 0, 30)).toBe(0);

    expect(clampPanoramaAzimuth(slice, 300, 30)).toBeCloseTo(330, 6);

    expect(clampPanoramaAzimuth(slice, 100, 30)).toBeCloseTo(30, 6);
  });

  it('pins the middle where the panel is as wide as the slice', () => {
    expect(clampPanoramaAzimuth(slice, 200, 90)).toBeCloseTo(0, 6);
  });
});

/** What a level line of sight falls away by over `d`, curvature less refraction. */
const drop = (d: number) => ((1 - 0.13) * d * d) / (2 * 6_371_000);

describe('groundElevation', () => {
  it('is the eye, plus the fall of a level line of sight', () => {
    // Row 100 of a 0.1° step from a 10° top is the horizontal.
    expect(groundElevation(render, 100, 10_000)).toBeCloseTo(
      1000 + drop(10_000),
      3,
    );
  });

  it('climbs with the angle the row stands at', () => {
    expect(groundElevation(render, 50, 10_000)).toBeCloseTo(
      1000 + 10_000 * Math.tan((5 * Math.PI) / 180) + drop(10_000),
      3,
    );
  });

  it('takes the unfolding back off, in proportion to the distance', () => {
    // The whole lift at the range, so the row drawn 5° up is really level.
    const lifted = { ...render, depthLift: 5, rangeM: 10_000 };

    expect(groundElevation(lifted, 50, 10_000)).toBeCloseTo(
      1000 + drop(10_000),
      3,
    );

    // Half the range, half the lift.
    expect(groundElevation(lifted, 75, 5000)).toBeCloseTo(1000 + drop(5000), 3);
  });
});
