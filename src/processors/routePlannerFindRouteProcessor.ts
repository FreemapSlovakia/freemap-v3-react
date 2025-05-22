import { mapsLoaded } from '../actions/mapsActions.js';
import {
  routePlannerAddMidpoint,
  routePlannerRemoveMidpoint,
  routePlannerSetFinish,
  routePlannerSetIsochroneParams,
  routePlannerSetMidpoint,
  routePlannerSetMode,
  routePlannerSetParams,
  routePlannerSetRoundtripParams,
  routePlannerSetStart,
  routePlannerSetTransportType,
  routePlannerSetWeighting,
  routePlannerSwapEnds,
} from '../actions/routePlannerActions.js';
import type { Processor } from '../middlewares/processorMiddleware.js';

export const updateRouteTypes = [
  routePlannerSetStart,
  routePlannerSetFinish,
  routePlannerSwapEnds,
  routePlannerAddMidpoint,
  routePlannerSetMidpoint,
  routePlannerRemoveMidpoint,
  routePlannerSetTransportType,
  routePlannerSetMode,
  routePlannerSetParams,
  routePlannerSetWeighting,
  routePlannerSetRoundtripParams,
  routePlannerSetIsochroneParams,
  mapsLoaded,
];

export const routePlannerFindRouteProcessor: Processor = {
  actionCreator: updateRouteTypes,
  id: 'routePlanner',
  errorKey: 'routePlanner.fetchingError',
  handle: async (...params) =>
    (await import('./routePlannerFindRouteProcessorHandler.js')).default(
      ...params,
    ),
};
