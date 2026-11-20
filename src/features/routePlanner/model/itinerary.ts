import type { TransportType } from '@shared/transportTypeDefs.js';
import type { RoutePoint } from './actions.js';
import { legTransports } from './legTransports.js';
import type { RouteStop } from './schedule.js';
import { isShaping, joinStretch } from './shaping.js';

export type ItineraryWaypoint = {
  /** Into `points`. */
  index: number;
  /** From the start. */
  metres: number;
  /** Moving time from the start, stops left out. */
  seconds: number;
  /** Epoch ms, from a set departure. */
  arrival?: number;
  leave?: number;
  stop?: RouteStop;
};

/** The way from one real waypoint to the next, over any shaping points. */
export type ItineraryLeg<L> = {
  /** The first and last of the route's legs it joins. */
  legs: [from: number, to: number];
  /** Those legs. */
  joined: L[];
  metres: number;
  seconds: number;
  /** In the order travelled. */
  transports: TransportType[];
};

export type Itinerary<L> = {
  waypoints: ItineraryWaypoint[];
  /** `legs[i]` runs from `waypoints[i]` to `waypoints[i + 1]`. */
  legs: ItineraryLeg<L>[];
};

/**
 * A route in order, by its real waypoints, with each point's `times` where a
 * departure gives them; undefined where its legs don't belong to the points.
 */
export function itinerary<L extends { distance: number; duration: number }>(
  points: readonly RoutePoint[],
  transportType: TransportType,
  routeLegs: readonly L[],
  times?: readonly { arrival: number; leave: number }[],
): Itinerary<L> | undefined {
  if (routeLegs.length !== points.length - 1 || routeLegs.length === 0) {
    return undefined;
  }

  const transports = legTransports(points, transportType);

  const waypoints: ItineraryWaypoint[] = [];

  const legs: ItineraryLeg<L>[] = [];

  let metres = 0;

  let seconds = 0;

  for (const [index, point] of points.entries()) {
    if (index > 0) {
      metres += routeLegs[index - 1]!.distance;

      seconds += routeLegs[index - 1]!.duration;
    }

    if (isShaping(points, index, 'route')) {
      continue;
    }

    waypoints.push({
      index,
      metres,
      seconds,
      ...times?.[index],
      ...(point?.stop && index > 0 && index < points.length - 1
        ? { stop: point.stop }
        : {}),
    });

    if (index < routeLegs.length) {
      const { bounds, joined, metres, seconds } = joinStretch(
        points,
        'route',
        routeLegs,
        index,
      );

      const [from, to] = bounds;

      legs.push({
        legs: bounds,
        joined,
        metres,
        seconds,
        // Each change of transport once.
        transports: transports
          .slice(from, to + 1)
          .filter((transport, i, all) => all[i - 1] !== transport),
      });
    }
  }

  return { waypoints, legs };
}
