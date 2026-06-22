import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { colorizerNeedsElevation } from '@shared/colorizers/index.js';
import { routePlannerColorizeBy, routePlannerSetResult } from '../actions.js';
import { ensureRouteElevations } from '../ensureRouteElevations.js';

export const routePlannerColorizeProcessor: Processor<
  typeof routePlannerColorizeBy | typeof routePlannerSetResult
> = {
  actionCreator: [routePlannerColorizeBy, routePlannerSetResult],
  handle: async ({ dispatch, getState }) => {
    const { colorizeBy } = getState().routePlanner;

    // Elevation-derived modes need a complete local profile; the result is
    // cached so switching between them refetches nothing. Re-running on a new
    // result refills the (now reset) cache while the mode stays applied. Other
    // modes read recorded coordinate properties and need no fill.
    if (colorizeBy && colorizerNeedsElevation(colorizeBy)) {
      await ensureRouteElevations(getState, dispatch);
    }
  },
};
