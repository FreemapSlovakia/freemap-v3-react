import type { TransportType } from '@shared/transportTypeDefs.js';
import type { RoutePoint } from './actions.js';

/**
 * The transport each leg of an ordered route is planned with: a leg takes the
 * transport of the point it starts from, and the route's transport where that
 * point sets none. The find-route handler segments its requests by exactly this
 * rule, so whatever credits the routers reads it from here rather than keeping
 * its own copy to drift.
 *
 * Only `route` mode honours the per-point overrides — every other mode plans the
 * whole route with the route's transport — so callers outside the handler check
 * the mode themselves.
 */
export function legTransports(
  points: RoutePoint[],
  defaultTransport: TransportType,
): TransportType[] {
  // A point can be absent (the URL spells a finish-only route with a leading
  // empty one), hence the optional read.
  return points
    .slice(0, -1)
    .map((point) => point?.transport ?? defaultTransport);
}

/** Which legs a transport change applies to. */
export type TransportScope =
  /** Every leg, and the legs added later. */
  | { type: 'route' }
  /** The trailing legs that use the route's transport, and the legs added later. */
  | { type: 'last-section' }
  /** Only the legs added later. */
  | { type: 'next' }
  | { type: 'leg'; leg: number }
  /** The run of neighbouring legs sharing the transport of `leg`. */
  | { type: 'section'; leg: number }
  /** Every leg sharing the transport of `leg`. */
  | { type: 'same-transport'; leg: number };

/** The first and last leg of the run of same-transport legs around `leg`. */
export function sectionBounds(
  legs: TransportType[],
  leg: number,
): [from: number, to: number] {
  let from = leg;
  let to = leg;

  while (from > 0 && legs[from - 1] === legs[leg]) {
    from--;
  }

  while (to < legs.length - 1 && legs[to + 1] === legs[leg]) {
    to++;
  }

  return [from, to];
}

/**
 * The trailing run of legs using the route's transport — the part the next
 * added leg continues — or nothing where the last leg was set apart.
 */
export function lastSection(
  legs: TransportType[],
  routeTransport: TransportType,
): [from: number, to: number] | undefined {
  return legs.at(-1) === routeTransport
    ? sectionBounds(legs, legs.length - 1)
    : undefined;
}

/** How many separate runs of neighbouring legs use `transport`. */
export function sectionCount(
  legs: TransportType[],
  transport: TransportType,
): number {
  return legs.filter((t, i) => t === transport && legs[i - 1] !== transport)
    .length;
}

/**
 * The route after `transport` is applied to the legs `scope` names. The route's
 * own transport is what the next added leg takes, so a point stores one only
 * where its leg differs from it.
 */
export function applyTransport(
  points: RoutePoint[],
  routeTransport: TransportType,
  transport: TransportType,
  scope: TransportScope,
): { points: RoutePoint[]; transportType: TransportType } {
  const legs = legTransports(points, routeTransport);

  let next = routeTransport;

  const set = (from: number, to: number) => {
    // A section reaching the end carries the next leg with it, as long as the
    // next leg continues it rather than having been set apart.
    if (to === legs.length - 1 && legs[to] === routeTransport) {
      next = transport;
    }

    legs.fill(transport, from, to + 1);
  };

  switch (scope.type) {
    case 'route':
      legs.fill(transport);

      next = transport;

      break;

    case 'last-section': {
      const section = lastSection(legs, routeTransport);

      if (section) {
        set(...section);
      }

      next = transport;

      break;
    }

    case 'next':
      next = transport;

      break;

    case 'leg':
      legs[scope.leg] = transport;

      break;

    case 'section':
      set(...sectionBounds(legs, scope.leg));

      break;

    case 'same-transport': {
      const old = legs[scope.leg];

      legs.forEach((leg, i) => {
        if (leg === old) {
          set(i, i);
        }
      });

      break;
    }
  }

  return {
    transportType: next,
    points: points.map((point, i) => {
      if (!point) {
        return point;
      }

      const { transport: _, ...rest } = point;

      const leg = legs[i];

      return leg === undefined || leg === next
        ? rest
        : { ...rest, transport: leg };
    }),
  };
}
