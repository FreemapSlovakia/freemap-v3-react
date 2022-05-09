import { mapsLoaded } from 'fm3/actions/mapsActions';
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
} from 'fm3/actions/routePlannerActions';
import { Processor } from 'fm3/middlewares/processorMiddleware';

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
    (await import('./routePlannerFindRouteProcessorHandler')).default(
      ...params,
    ),
};
