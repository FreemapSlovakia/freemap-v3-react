import z from 'zod';
import type { TimedRoute } from './routeRows.js';

// Only what timing the route needs, so an event's panel doesn't parse the map.
const MapRouteSchema = z.object({
  data: z.object({
    routePlanner: z
      .object({
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

/** The route a saved map stores, or null when it stores none. */
export async function fetchMapRoute(mapId: string): Promise<TimedRoute | null> {
  const res = await fetch(
    `${process.env['API_URL']}/maps/${encodeURIComponent(mapId)}`,
    { headers: { accept: 'application/json' } },
  );

  if (!res.ok) {
    throw new Error(`map ${mapId}: ${res.status}`);
  }

  return (
    MapRouteSchema.parse(await res.json()).data.routePlanner?.result
      ?.alternative ?? null
  );
}
