import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { mapsLoaded, mapsLoadFailed } from '@features/myMaps/model/actions.js';
import {
  routePlannerAddPoint,
  routePlannerFindRoute,
  routePlannerRecompute,
  routePlannerRemovePoint,
  routePlannerSetFinish,
  routePlannerSetIsochroneParams,
  routePlannerSetMode,
  routePlannerSetParams,
  routePlannerSetPoint,
  routePlannerSetPoints,
  routePlannerSetRoundtripParams,
  routePlannerSetStart,
  routePlannerSetTransportType,
  routePlannerSwapEnds,
} from '../actions.js';
import { storedRouteIsShowing } from '../reducer.js';

export const updateRouteTypes = [
  routePlannerSetStart,
  routePlannerSetFinish,
  routePlannerSwapEnds,
  routePlannerAddPoint,
  routePlannerSetPoint,
  routePlannerSetPoints,
  routePlannerRemovePoint,
  routePlannerSetTransportType,
  routePlannerSetMode,
  routePlannerSetParams,
  routePlannerSetRoundtripParams,
  routePlannerSetIsochroneParams,
  routePlannerRecompute,
  routePlannerFindRoute,
  mapsLoaded,
  // Opens no map, so nothing else answers for the waypoints `deferRouting` left
  // unrouted.
  mapsLoadFailed,
];

export const routePlannerFindRouteProcessor: Processor = {
  actionCreator: updateRouteTypes,
  // The map's stored route already answers for these waypoints and is on screen
  // — asking the router again would cost a request, fail offline, and come back
  // with whatever the routing graph says today rather than what was planned.
  // Where it answers but isn't showing, the handler puts it back instead.
  statePredicate: (state) => !storedRouteIsShowing(state.routePlanner),
  // See `deferRouting`: the map on its way in owns the route.
  actionPredicate: (action) =>
    !routePlannerSetParams.match(action) || !action.payload.deferRouting,
  id: 'routePlanner',
  // route-fetch errors are reported by the handler itself (see
  // findRouteProcessorHandler); unexpected throws fall back to the generic
  // processor-error toast.
  handle: async (...params) =>
    (
      await import(
        /* webpackChunkName: "route-planner-find-route-processor-handler" */
        './findRouteProcessorHandler.js'
      )
    ).default(...params),
};
