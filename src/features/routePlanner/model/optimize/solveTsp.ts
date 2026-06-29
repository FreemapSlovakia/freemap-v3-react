/**
 * Travelling-salesman solver for waypoint-order optimization. Pure and
 * dependency-free: it reads only a precomputed cost matrix and never touches the
 * network. The matrix builder lives in `buildCostMatrix.ts`; the Redux wiring in
 * `../processors/optimizeOrderProcessorHandler.ts`.
 */

/** Directed cost matrix: `matrix[from][to]`, diagonal `0`, unroutable `Infinity`. */
export type CostMatrix = number[][];

export interface TspOptions {
  /** Keep node 0 first. Defaults to `true`; forced on by `roundTrip`. */
  fixStart?: boolean;
  /** Keep the last node (index `n - 1`) last. Ignored when `roundTrip`. */
  fixEnd?: boolean;
  /** Cost a closed loop returning to node 0. Implies a fixed start. */
  roundTrip?: boolean;
}

export interface TspResult {
  /** The optimized visiting order as original indices. */
  order: number[];
  /** Total cost of `order` under the chosen options (`Infinity` if unroutable). */
  cost: number;
}

/** Above this many nodes Held–Karp's `2ⁿ` table is too big; fall back to local search. */
export const HELD_KARP_MAX = 13;

const EPS = 1e-9;

/** Solves exactly for small `n` (Held–Karp), else nearest-neighbor + 2-opt/Or-opt. */
export function solveTsp(
  matrix: CostMatrix,
  options: TspOptions = {},
): TspResult {
  const n = matrix.length;

  if (n <= 2) {
    return { order: identity(n), cost: tourCost(matrix, identity(n), options) };
  }

  return n <= HELD_KARP_MAX
    ? heldKarp(matrix, options)
    : localSearch(matrix, options);
}

function identity(n: number): number[] {
  return Array.from({ length: n }, (_, i) => i);
}

/** Total cost of visiting `tour` in order, plus the return leg when `roundTrip`. */
export function tourCost(
  matrix: CostMatrix,
  tour: number[],
  { roundTrip }: TspOptions = {},
): number {
  let cost = 0;

  for (let i = 0; i < tour.length - 1; i++) {
    cost += matrix[tour[i]!]![tour[i + 1]!]!;
  }

  if (roundTrip && tour.length > 1) {
    cost += matrix[tour.at(-1)!]![tour[0]!]!;
  }

  return cost;
}

/* ---------------------------------------------------------------- Held–Karp */

type EndPolicy =
  | { type: 'fixed'; end: number }
  | { type: 'free' }
  | { type: 'roundtrip' };

function heldKarp(matrix: CostMatrix, options: TspOptions): TspResult {
  const n = matrix.length;

  const fixStart = options.roundTrip || (options.fixStart ?? true);

  const end = !options.roundTrip && options.fixEnd ? n - 1 : null;

  const endPolicy: EndPolicy = options.roundTrip
    ? { type: 'roundtrip' }
    : end !== null
      ? { type: 'fixed', end }
      : { type: 'free' };

  const size = 1 << n;

  const cost = makeTable(size, n, Infinity);

  const parent = makeTable(size, n, -1);

  if (fixStart) {
    return heldKarpFixedStart(matrix, 0, endPolicy, cost, parent);
  }

  // Free start: every start is a candidate; the best wins. The two DP tables are
  // allocated once and refilled per start rather than reallocated n times.
  let best: TspResult = { order: identity(n), cost: Infinity };

  for (let start = 0; start < n; start++) {
    if (end !== null && start === end) {
      continue;
    }

    const result = heldKarpFixedStart(matrix, start, endPolicy, cost, parent);

    if (result.cost < best.cost) {
      best = result;
    }
  }

  return best;
}

function makeTable(rows: number, cols: number, fill: number): number[][] {
  return Array.from({ length: rows }, () => new Array<number>(cols).fill(fill));
}

/**
 * Exact shortest Hamiltonian path/cycle from `start` via DP over visited
 * subsets. The caller supplies the `cost`/`parent` tables so the free-start
 * sweep can reuse them; they are reset here before use.
 */
function heldKarpFixedStart(
  matrix: CostMatrix,
  start: number,
  endPolicy: EndPolicy,
  cost: number[][],
  parent: number[][],
): TspResult {
  const n = matrix.length;

  const size = 1 << n;

  // cost[subset][last]: cheapest path from `start` covering exactly `subset`
  // (which always includes both `start` and `last`) and ending at `last`.
  for (const row of cost) {
    row.fill(Infinity);
  }

  for (const row of parent) {
    row.fill(-1);
  }

  cost[1 << start]![start] = 0;

  for (let subset = 0; subset < size; subset++) {
    if (!(subset & (1 << start))) {
      continue;
    }

    for (let last = 0; last < n; last++) {
      const c = cost[subset]![last]!;

      if (!(subset & (1 << last)) || c === Infinity) {
        continue;
      }

      for (let next = 0; next < n; next++) {
        if (subset & (1 << next)) {
          continue;
        }

        const nc = c + matrix[last]![next]!;

        const nextSubset = subset | (1 << next);

        if (nc < cost[nextSubset]![next]!) {
          cost[nextSubset]![next] = nc;
          parent[nextSubset]![next] = last;
        }
      }
    }
  }

  const full = size - 1;

  let bestEnd = -1;

  let best = Infinity;

  if (endPolicy.type === 'fixed') {
    bestEnd = endPolicy.end;
    best = cost[full]![bestEnd]!;
  } else {
    for (let last = 0; last < n; last++) {
      const total =
        endPolicy.type === 'roundtrip'
          ? cost[full]![last]! + matrix[last]![start]!
          : cost[full]![last]!;

      if (total < best) {
        best = total;
        bestEnd = last;
      }
    }
  }

  if (bestEnd === -1 || best === Infinity) {
    return { order: identity(n), cost: Infinity };
  }

  const order: number[] = [];

  let subset = full;

  let last = bestEnd;

  while (last !== -1) {
    order.push(last);

    const prev = parent[subset]![last]!;

    subset ^= 1 << last;

    last = prev;
  }

  order.reverse();

  return { order, cost: best };
}

/* ------------------------------------------ nearest-neighbor + local search */

// Each move is scored by recomputing the full tour cost. The matrix is directed
// (it respects one-ways/turn costs), so a segment reversal flips every internal
// edge — the usual O(1) two-edge 2-opt delta is only valid for symmetric costs
// and would be wrong here. `n` is small (network round-trips dominate anyway).
function localSearch(matrix: CostMatrix, options: TspOptions): TspResult {
  const n = matrix.length;

  const fixStart = options.roundTrip || (options.fixStart ?? true);

  const fixEnd = !options.roundTrip && Boolean(options.fixEnd);

  let order = nearestNeighbor(matrix, { fixEnd, roundTrip: options.roundTrip });

  let cost = tourCost(matrix, order, options);

  // Locked positions never move; for a round trip node 0 anchors the loop.
  const lo = fixStart ? 1 : 0;

  const hi = fixEnd ? n - 2 : n - 1;

  for (let improved = true; improved; ) {
    improved = false;

    // 2-opt: reverse a sub-path and keep it if total cost drops.
    for (let i = lo; i <= hi; i++) {
      for (let j = i + 1; j <= hi; j++) {
        const candidate = order.slice();

        reverse(candidate, i, j);

        const candidateCost = tourCost(matrix, candidate, options);

        if (candidateCost + EPS < cost) {
          order = candidate;
          cost = candidateCost;
          improved = true;
        }
      }
    }

    // Or-opt: relocate a short run of 1–3 consecutive nodes elsewhere.
    for (let len = 1; len <= 3; len++) {
      for (let i = lo; i + len - 1 <= hi; i++) {
        const segment = order.slice(i, i + len);

        const rest = [...order.slice(0, i), ...order.slice(i + len)];

        for (let k = lo; k <= rest.length - (fixEnd ? 1 : 0); k++) {
          if (k === i) {
            continue;
          }

          const candidate = [...rest.slice(0, k), ...segment, ...rest.slice(k)];

          const candidateCost = tourCost(matrix, candidate, options);

          if (candidateCost + EPS < cost) {
            order = candidate;
            cost = candidateCost;
            improved = true;
          }
        }
      }
    }
  }

  return { order, cost };
}

/** Greedy seed tour; reserves the last node when the end is fixed. */
function nearestNeighbor(
  matrix: CostMatrix,
  { fixEnd, roundTrip }: { fixEnd: boolean; roundTrip?: boolean },
): number[] {
  const n = matrix.length;

  const endNode = fixEnd && !roundTrip ? n - 1 : -1;

  const visited = new Array<boolean>(n).fill(false);

  const tour = [0];

  visited[0] = true;

  const target = endNode >= 0 ? n - 1 : n;

  while (tour.length < target) {
    const curr = tour.at(-1)!;

    let bestNext = -1;

    let bestCost = Infinity;

    for (let j = 0; j < n; j++) {
      if (visited[j] || j === endNode) {
        continue;
      }

      if (matrix[curr]![j]! < bestCost) {
        bestCost = matrix[curr]![j]!;
        bestNext = j;
      }
    }

    if (bestNext === -1) {
      // Remaining nodes are all unreachable from here; append in index order.
      bestNext = visited.findIndex((v, j) => !v && j !== endNode);
    }

    visited[bestNext] = true;

    tour.push(bestNext);
  }

  if (endNode >= 0) {
    tour.push(endNode);
  }

  return tour;
}

function reverse(arr: number[], from: number, to: number): void {
  for (let i = from, j = to; i < j; i++, j--) {
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }
}
