import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { mapsLoaded } from '@features/myMaps/model/actions.js';
import {
  routePlannerAddPoint,
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
  mapsLoaded,
];

export const routePlannerFindRouteProcessor: Processor = {
  actionCreator: updateRouteTypes,
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
