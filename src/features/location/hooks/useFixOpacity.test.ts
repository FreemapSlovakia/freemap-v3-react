import { describe, expect, it } from 'vitest';
import {
  FRESH_MS,
  fixOpacity,
  MIN_OPACITY,
  STALE_MS,
} from './useFixOpacity.js';

describe('fixOpacity', () => {
  it('leaves a fresh fix fully opaque', () => {
    expect(fixOpacity(0)).toBe(1);

    expect(fixOpacity(FRESH_MS)).toBe(1);
  });

  it('ramps linearly between the two thresholds', () => {
    expect(fixOpacity((FRESH_MS + STALE_MS) / 2)).toBeCloseTo(
      (1 + MIN_OPACITY) / 2,
      2,
    );
  });

  it('bottoms out instead of hiding the last known position', () => {
    expect(fixOpacity(STALE_MS)).toBe(MIN_OPACITY);

    expect(fixOpacity(STALE_MS * 100)).toBe(MIN_OPACITY);
  });

  it('never increases with age', () => {
    let prev = 1;

    for (let age = 0; age <= STALE_MS + 1000; age += 500) {
      const value = fixOpacity(age);

      expect(value).toBeLessThanOrEqual(prev);

      prev = value;
    }
  });

  it('tolerates a fix timestamped in the future by a skewed clock', () => {
    expect(fixOpacity(-5000)).toBe(1);
  });
});
