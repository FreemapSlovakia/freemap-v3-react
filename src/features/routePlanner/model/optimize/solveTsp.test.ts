import { describe, expect, it } from 'vitest';
import { type CostMatrix, solveTsp, tourCost } from './solveTsp.js';

/**
 * Builds a directed cost matrix from 1-D positions; the cost between two nodes
 * is the absolute distance, so optimal orders are checkable by hand.
 */
function lineMatrix(positions: number[]): CostMatrix {
  return positions.map((a) => positions.map((b) => Math.abs(a - b)));
}

/** Deterministic PRNG so the "larger random" case is reproducible. */
function mulberry32(seed: number): () => number {
  let a = seed;

  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function euclideanMatrix(points: [number, number][]): CostMatrix {
  return points.map(([ax, ay]) =>
    points.map(([bx, by]) => Math.hypot(ax - bx, ay - by)),
  );
}

/** A nearest-neighbor tour from node 0 — the baseline 2-opt must improve on. */
function nearestNeighborTour(matrix: CostMatrix): number[] {
  const n = matrix.length;

  const visited = new Array<boolean>(n).fill(false);

  const tour = [0];

  visited[0] = true;

  while (tour.length < n) {
    const curr = tour.at(-1)!;

    let best = -1;

    let bestCost = Infinity;

    for (let j = 0; j < n; j++) {
      if (!visited[j] && matrix[curr]![j]! < bestCost) {
        bestCost = matrix[curr]![j]!;
        best = j;
      }
    }

    visited[best] = true;
    tour.push(best);
  }

  return tour;
}

function isPermutation(order: number[], n: number): boolean {
  return (
    order.length === n && new Set(order).size === n && order.every((v) => v < n)
  );
}

describe('solveTsp — exact (Held–Karp) on a hand-checkable matrix', () => {
  // Indices map to 1-D positions [0, 30, 10, 20]; node 0 sits at one end.
  const matrix = lineMatrix([0, 30, 10, 20]);

  it('fixed start visits the line end to end (cost 30)', () => {
    const { order, cost } = solveTsp(matrix, { fixStart: true });

    expect(order).toEqual([0, 2, 3, 1]);
    expect(cost).toBe(30);
  });

  it('fixed start and end keeps node 0 first and node 3 last (cost 40)', () => {
    const { order, cost } = solveTsp(matrix, {
      fixStart: true,
      fixEnd: true,
    });

    expect(order[0]).toBe(0);
    expect(order.at(-1)).toBe(3);
    expect(order).toEqual([0, 2, 1, 3]);
    expect(cost).toBe(40);
  });

  it('round trip returns to the start (cost 60 = twice the span)', () => {
    const { order, cost } = solveTsp(matrix, { roundTrip: true });

    expect(order[0]).toBe(0);
    expect(cost).toBe(60);
    expect(tourCost(matrix, order, { roundTrip: true })).toBe(60);
  });

  it('free order traverses the whole line once (cost 30)', () => {
    const { order, cost } = solveTsp(matrix, { fixStart: false });

    expect(isPermutation(order, 4)).toBe(true);
    expect(cost).toBe(30);
  });

  it('routes around an unroutable direct leg without crashing', () => {
    // Direct 0→2 is impossible, but 0→1→2 works.
    const m: CostMatrix = [
      [0, 1, Infinity],
      [1, 0, 1],
      [Infinity, 1, 0],
    ];

    const { order, cost } = solveTsp(m, { fixStart: true });

    expect(order).toEqual([0, 1, 2]);
    expect(cost).toBe(2);
  });
});

describe('solveTsp — local search (2-opt/Or-opt) on a larger matrix', () => {
  const rand = mulberry32(42);

  const points = Array.from(
    { length: 25 },
    () => [rand() * 100, rand() * 100] as [number, number],
  );

  const matrix = euclideanMatrix(points);

  it('improves on the nearest-neighbor tour for n > 13', () => {
    const nnCost = tourCost(matrix, nearestNeighborTour(matrix));

    const { order, cost } = solveTsp(matrix, { fixStart: true });

    expect(isPermutation(order, points.length)).toBe(true);
    expect(order[0]).toBe(0);
    expect(cost).toBeLessThan(nnCost);
  });

  it('keeps locked endpoints for each variant', () => {
    const n = points.length;

    expect(solveTsp(matrix, { fixStart: true }).order[0]).toBe(0);

    const fixedEnds = solveTsp(matrix, { fixStart: true, fixEnd: true }).order;

    expect(fixedEnds[0]).toBe(0);
    expect(fixedEnds.at(-1)).toBe(n - 1);

    const round = solveTsp(matrix, { roundTrip: true });

    expect(round.order[0]).toBe(0);
    expect(isPermutation(round.order, n)).toBe(true);
  });
});
