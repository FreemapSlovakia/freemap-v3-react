import { describe, expect, it } from 'vitest';
import { STEPS } from './simplifyDialog.js';
import { MAX_TOLERANCE, MIN_TOLERANCE } from './simplifyTolerance.js';

describe('the simplify slider ladder', () => {
  it('spans the whole range of tolerances', () => {
    expect(STEPS[0]).toBe(MIN_TOLERANCE);

    expect(STEPS.at(-1)).toBe(MAX_TOLERANCE);
  });

  it('climbs, never repeating a rung', () => {
    for (const [i, step] of STEPS.entries()) {
      if (i > 0) {
        expect(step).toBeGreaterThan(STEPS[i - 1]!);
      }
    }
  });

  // The point of the ladder: no 0.19 next to 0.21, and no 46/51/56 either.
  it('offers only numbers someone would have typed themselves', () => {
    for (const step of STEPS) {
      expect(step).toBe(Number(step.toPrecision(2)));
    }
  });

  it('steps by about a quarter, so the fine end stays reachable', () => {
    for (const [i, step] of STEPS.entries()) {
      if (i > 0) {
        const ratio = step / STEPS[i - 1]!;

        expect(ratio).toBeGreaterThan(1.1);

        expect(ratio).toBeLessThan(1.4);
      }
    }
  });
});
