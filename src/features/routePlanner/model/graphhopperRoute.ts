import z from 'zod';

/** The self-hosted GraphHopper point-to-point routing endpoint. */
export const graphhopperRouteUrl = (): string =>
  process.env['GRAPHHOPPER_URL'] + '/route';

/** Edge types kept off the route (shared by the router and the cost-matrix builder). */
export const ghSnapPreventions = ['trunk', 'motorway', 'tunnel', 'ferry'];

/**
 * The per-path cost fields GraphHopper always returns (time in ms, distance in
 * m). The full path schema in the router spreads this; the cost-matrix builder
 * uses it directly since it requests neither geometry nor instructions.
 */
export const GraphhopperPathCostSchema = z.object({
  distance: z.number(),
  time: z.number(),
});
