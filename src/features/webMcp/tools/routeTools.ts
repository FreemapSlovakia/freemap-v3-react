import { openTool } from '@app/store/actions.js';
import {
  routeKey,
  routePlannerSetMode,
  routePlannerSetPoints,
  routePlannerSetTransportType,
} from '@features/routePlanner/model/actions.js';
import { TransportTypeSchema } from '@shared/transportTypeDefs.js';
import z from 'zod';
import { defineTool } from '../tool.js';
import { waitForState } from '../waitForState.js';

/** How many itinerary steps one answer carries; a long route has thousands. */
const MAX_STEPS = 200;

export const routeTools = [
  defineTool({
    name: 'plan-route',
    description:
      'Plans a route through the given waypoints and draws it on the map, opening the route finder. Returns its length and estimated time. "trip" mode reorders the waypoints into the shortest round of them all; "route" keeps the given order.',
    input: z.object({
      points: z
        .array(
          z.object({
            lat: z.number().min(-90).max(90),
            lon: z.number().min(-180).max(180),
          }),
        )
        .min(2)
        .describe('Waypoints, from start to finish.'),
      transportType: TransportTypeSchema.optional().describe(
        'How the route is travelled; defaults to what the app is set to (initially hiking).',
      ),
      mode: z.enum(['route', 'trip']).optional(),
    }),
    async execute({ points, transportType, mode }, { store, signal }) {
      store.dispatch(openTool('route-planner'));

      if (transportType) {
        store.dispatch(routePlannerSetTransportType(transportType));
      }

      if (mode) {
        store.dispatch(routePlannerSetMode(mode));
      }

      store.dispatch(routePlannerSetPoints(points));

      const key = routeKey(store.getState().routePlanner);

      // Resolves on the key alone: a request the router could not answer sets
      // the same key with no alternatives, and waiting for one would time out
      // rather than say so.
      const result = await waitForState(
        store,
        (state) => state.routePlanner.resultKey === key && state.routePlanner,
        { signal },
      );

      const alternative = result.alternatives[result.activeAlternativeIndex];

      if (!alternative) {
        throw new Error(
          'No route was found between these points for this transport type.',
        );
      }

      return {
        transportType: result.transportType,
        mode: result.mode,
        distance: alternative.distance,
        duration: alternative.duration,
        alternatives: result.alternatives.length,
        waypoints: result.waypoints.map((waypoint) => ({
          name: waypoint.name,
          lon: waypoint.location[0],
          lat: waypoint.location[1],
        })),
        url: window.location.href,
      };
    },
  }),

  defineTool({
    name: 'get-route-itinerary',
    description:
      'Returns the turn-by-turn steps of the route currently planned, with the distance and time of each. Distances are in metres, times in seconds.',
    input: z.object({}),
    execute(_args, { store }) {
      const { alternatives, activeAlternativeIndex } =
        store.getState().routePlanner;

      const alternative = alternatives[activeAlternativeIndex];

      if (!alternative) {
        throw new Error('No route is planned. Call plan-route first.');
      }

      const steps = alternative.legs
        .flatMap((leg) => leg.steps)
        .map((step) => ({
          name: step.name,
          maneuver: step.maneuver.modifier
            ? `${step.maneuver.type} ${step.maneuver.modifier}`
            : step.maneuver.type,
          distance: step.distance,
          duration: step.duration,
        }));

      return {
        distance: alternative.distance,
        duration: alternative.duration,
        steps: steps.slice(0, MAX_STEPS),
        omittedSteps: Math.max(0, steps.length - MAX_STEPS),
      };
    },
  }),
];
