import { httpRequest } from '@app/httpRequest.js';
import type { RootState } from '@app/store/store.js';
import type { ActionCreatorMatchable } from '@shared/cancelRegister.js';
import type { LatLon } from '@shared/types/common.js';
import z from 'zod';
import {
  GraphhopperPathCostSchema,
  ghSnapPreventions,
  graphhopperRouteUrl,
} from '../graphhopperRoute.js';
import type { CostMatrix } from './solveTsp.js';

const GraphhopperRouteCostSchema = z.object({
  paths: z.array(GraphhopperPathCostSchema),
});

export interface BuildCostMatrixParams {
  /** Waypoints in their current order; the matrix is indexed to match. */
  points: LatLon[];
  /** GraphHopper profile (e.g. `car`, `hike`) from the selected transport type. */
  profile: string;
  /** UI language, forwarded to GraphHopper like the main route request. */
  locale: string;
  getState: () => RootState;
  /** Cancel in-flight legs when the route inputs change (mirrors the router). */
  cancelActions?: ActionCreatorMatchable[];
  /** Max simultaneous `/route` calls; keeps under the browser per-host cap. */
  concurrency?: number;
}

/**
 * Builds an N×N directed cost matrix from point-to-point GraphHopper `/route`
 * calls (the self-hosted instance has no Matrix API). Travel time is the cost;
 * the diagonal is `0` and any failed/unroutable leg is `Infinity` so a single
 * bad pair can't sink the whole optimization. Geometry is skipped via
 * `calc_points: false`. Calls run through a bounded concurrency pool.
 */
export async function buildCostMatrix({
  points,
  profile,
  locale,
  getState,
  cancelActions,
  concurrency = 8,
}: BuildCostMatrixParams): Promise<CostMatrix> {
  const n = points.length;

  const matrix: CostMatrix = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? 0 : Infinity)),
  );

  const pairs: [number, number][] = [];

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i !== j) {
        pairs.push([i, j]);
      }
    }
  }

  let cursor = 0;

  async function worker(): Promise<void> {
    for (let k = cursor++; k < pairs.length; k = cursor++) {
      const [i, j] = pairs[k]!;

      matrix[i]![j] = await legCost(points[i]!, points[j]!);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, pairs.length) }, worker),
  );

  return matrix;

  async function legCost(from: LatLon, to: LatLon): Promise<number> {
    try {
      const response = await httpRequest({
        getState,
        method: 'POST',
        url: graphhopperRouteUrl(),
        data: {
          snap_preventions: ghSnapPreventions,
          calc_points: false,
          instructions: false,
          points_encoded: false,
          profile,
          locale,
          points: [
            [from.lon, from.lat],
            [to.lon, to.lat],
          ],
        },
        expectedStatus: [200, 400],
        cancelActions,
      });

      if (response.status === 400) {
        return Infinity;
      }

      const path = GraphhopperRouteCostSchema.parse(await response.json())
        .paths[0];

      // Travel time is the cost; both fields are always present on a 200 so the
      // matrix never mixes time (ms) with distance (m).
      return path ? path.time : Infinity;
    } catch {
      // An aborted/failed leg must not crash the optimization; treat as
      // unroutable and let the solver route around it.
      return Infinity;
    }
  }
}
