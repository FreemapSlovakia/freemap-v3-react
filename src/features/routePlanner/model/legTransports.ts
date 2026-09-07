import type { TransportType } from '@shared/transportTypeDefs.js';
import type { RoutePoint } from './actions.js';

/**
 * The transport each leg of an ordered route is planned with: a leg takes the
 * transport of the point it starts from, and the route's default where that
 * point sets none. The find-route handler segments its requests by exactly this
 * rule, so whatever credits the routers reads it from here rather than keeping
 * its own copy to drift.
 *
 * Only `route` mode honours the per-point overrides — every other mode plans the
 * whole route with the default — so callers outside the handler check the mode
 * themselves.
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
