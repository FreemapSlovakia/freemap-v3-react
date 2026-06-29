import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { colorizerNeedsElevation } from '@shared/colorizers/index.js';
import {
  routePlannerColorizeBy,
  routePlannerSetActiveAlternativeIndex,
  routePlannerSetResult,
} from '../actions.js';
import { ensureRouteRenderGeojson } from '../ensureRouteRenderGeojson.js';

export const routePlannerColorizeProcessor: Processor<
  | typeof routePlannerColorizeBy
  | typeof routePlannerSetResult
  | typeof routePlannerSetActiveAlternativeIndex
> = {
  actionCreator: [
    routePlannerColorizeBy,
    routePlannerSetResult,
    routePlannerSetActiveAlternativeIndex,
  ],
  handle: async ({ dispatch, getState }) => {
    const { colorizeBy } = getState().routePlannerSettings;

    // Elevation-derived modes need the densified DEM render line; it's cached
    // so switching between them refetches nothing. A new result or a different
    // alternative resets that cache, so rebuild it while the mode stays
    // applied. Other modes (e.g. heading) read the route coordinates directly.
    if (colorizeBy && colorizerNeedsElevation(colorizeBy)) {
      await ensureRouteRenderGeojson(getState, dispatch);
    }
  },
};
