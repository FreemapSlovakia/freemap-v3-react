import {
  legStops,
  type RouteStop,
  RouteStopSchema,
  type TimedRoute,
} from '@features/routePlanner/model/schedule.js';
import z from 'zod';

// Only what timing the route needs, so an event's panel doesn't parse the map.
const MapRouteSchema = z.object({
  data: z.object({
    routePlanner: z
      .object({
        mode: z.string().optional(),
        // A stop this version can't read is dropped, not the whole route.
        points: z
          .array(
            z
              .object({ stop: RouteStopSchema.optional().catch(undefined) })
              .nullable(),
          )
          .optional(),
        result: z
          .object({
            alternative: z.object({
              legs: z.array(
                z.object({
                  steps: z.array(
                    z.object({
                      duration: z.number(),
                      geometry: z.object({
                        coordinates: z.array(z.array(z.number())),
                      }),
                    }),
                  ),
                }),
              ),
            }),
          })
          .optional(),
      })
      .optional(),
  }),
});

export type MapRoute = {
  route: TimedRoute;
  /** At the end of each leg, as `timedPositions` takes them. */
  stops: (RouteStop | undefined)[];
};

/** The route a saved map stores, with its stops; null when it stores none. */
export async function fetchMapRoute(mapId: string): Promise<MapRoute | null> {
  const res = await fetch(
    `${process.env['API_URL']}/maps/${encodeURIComponent(mapId)}`,
    { headers: { accept: 'application/json' } },
  );

  if (!res.ok) {
    throw new Error(`map ${mapId}: ${res.status}`);
  }

  const planner = MapRouteSchema.parse(await res.json()).data.routePlanner;

  const route = planner?.result?.alternative;

  return route
    ? {
        route,
        stops: legStops(planner.mode, planner.points ?? []),
      }
    : null;
}
