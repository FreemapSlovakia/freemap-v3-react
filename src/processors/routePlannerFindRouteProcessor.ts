import { mapsLoaded } from '../actions/mapsActions.js';
import {
  routePlannerAddPoint,
  routePlannerRemovePoint,
  routePlannerSetFinish,
  routePlannerSetIsochroneParams,
  routePlannerSetMode,
  routePlannerSetParams,
  routePlannerSetPoint,
  routePlannerSetRoundtripParams,
  routePlannerSetStart,
  routePlannerSetTransportType,
  routePlannerSwapEnds,
} from '../actions/routePlannerActions.js';
import type { Processor } from '../middlewares/processorMiddleware.js';

export const updateRouteTypes = [
  routePlannerSetStart,
  routePlannerSetFinish,
  routePlannerSwapEnds,
  routePlannerAddPoint,
  routePlannerSetPoint,
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
  errorKey: 'routePlanner.fetchingError',
  handle: async (...params) =>
    (
      await import(
        /* webpackChunkName: "route-planner-find-route-processor-handler" */
        './routePlannerFindRouteProcessorHandler.js'
      )
    ).default(...params),
};
