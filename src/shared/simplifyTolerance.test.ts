import type { Position } from 'geojson';
import { describe, expect, it } from 'vitest';
import {
  suggestSimplifyTolerance,
  vertexCount,
  verticesAt,
} from './simplifyTolerance.js';

// A recorded-looking line: a straight run with deterministic jitter, so nearly
// every vertex carries some detail a simplification has to weigh.
function track(n: number, jitter: number): Position[] {
  return Array.from({ length: n }, (_, i) => [
    17 + i / 10000,
    48 + Math.sin(i) * jitter,
  ]);
}

const square: Position[] = [
  [0, 0],
  [0.001, 0],
  [0.001, 0.001],
  [0, 0.001],
  [0, 0],
];

describe('vertexCount', () => {
  it('does not count a ring’s closing point as a point', () => {
    expect(vertexCount([square], true)).toBe(4);

    expect(vertexCount([square.slice(0, -1)])).toBe(4);
  });
});

describe('verticesAt', () => {
  // The readout is a promise about what the edit will do, so a ring has to be
  // counted the way `simplifyRing` thins it — not flattened to two points —
  // and on the same terms `vertexCount` states the "before" in.
  it('counts a ring as a ring when told it is one', () => {
    expect(verticesAt([square], 1000, true)).toBeGreaterThanOrEqual(3);

    expect(verticesAt([square], 0.1, true)).toBe(vertexCount([square], true));
  });

  // A loop track ends where it started, and is still thinned as an open line.
  it('does not take a closed line for a ring on its own', () => {
    expect(verticesAt([square], 1000)).toBe(2);
  });
});

describe('suggestSimplifyTolerance', () => {
  it('offers nothing for a line short enough to convert whole', () => {
    expect(suggestSimplifyTolerance([track(300, 0.0001)])).toBe(0);
  });

  it('offers a tolerance that brings a dense recording down to a few hundred vertices', () => {
    const line = track(4000, 0.0001);

    const suggested = suggestSimplifyTolerance([line]);

    expect(suggested).toBeGreaterThan(0);

    expect(verticesAt([line], suggested)).toBeLessThan(600);
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
