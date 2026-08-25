import { describe, expect, it } from 'vitest';
import { groundElevation } from './ray.js';

/** A frame whose top row looks 10° up, a tenth of a degree per row. */
const render = {
  altMax: 10,
  stepDeg: 0.1,
  eyeElevation: 1000,
  depthLift: 0,
  rangeM: 300_000,
};

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
