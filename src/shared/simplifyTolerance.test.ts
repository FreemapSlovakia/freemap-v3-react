import { simplify } from '@turf/simplify';
import type { LineString, Position } from 'geojson';
import { describe, expect, it } from 'vitest';
import {
  suggestSimplifyTolerance,
  TOLERANCE_UNIT,
} from './simplifyTolerance.js';

// A recorded-looking line: a straight run with deterministic jitter, so nearly
// every vertex carries some detail a simplification has to weigh.
function track(n: number, jitter: number): Position[] {
  return Array.from({ length: n }, (_, i) => [
    17 + i / 10000,
    48 + Math.sin(i) * jitter,
  ]);
}

const verticesAfter = (line: Position[], tolerance: number) =>
  simplify({ type: 'LineString', coordinates: line } satisfies LineString, {
    tolerance,
    highQuality: true,
  }).coordinates.length;

describe('suggestSimplifyTolerance', () => {
  it('offers nothing for a line short enough to convert whole', () => {
    expect(suggestSimplifyTolerance([track(300, 0.0001)])).toBe(0);
  });

  it('offers a factor that brings a dense recording down to a few hundred vertices', () => {
    const line = track(4000, 0.0001);

    const suggested = suggestSimplifyTolerance([line]);

    expect(suggested).toBeGreaterThan(0);

    expect(verticesAfter(line, suggested / TOLERANCE_UNIT)).toBeLessThan(600);
  });

  it('offers more simplification the noisier the recording', () => {
    const smooth = suggestSimplifyTolerance([track(4000, 0.00002)]);

    const noisy = suggestSimplifyTolerance([track(4000, 0.0004)]);

    expect(noisy).toBeGreaterThan(smooth);
  });

  it('weighs every line of the conversion together', () => {
    const line = track(500, 0.0001);

    // On its own each is short enough to be left alone; two of them are not.
    expect(suggestSimplifyTolerance([line])).toBe(0);

    expect(suggestSimplifyTolerance([line, line])).toBeGreaterThan(0);
  });
});
