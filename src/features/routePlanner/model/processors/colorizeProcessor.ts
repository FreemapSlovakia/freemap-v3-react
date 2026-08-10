import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { authSetUser } from '@features/auth/model/actions.js';
import { elevationSetSettings } from '@features/elevationChart/model/actions.js';
import { affectsElevationSmoothing } from '@features/elevationChart/model/settingsReducer.js';
import { isPremium } from '@features/premium/premium.js';
import { colorizerNeedsElevation } from '@shared/colorizers/index.js';
import { unlockedColorizingMode } from '@shared/colorizers/premiumColorize.js';
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
  | typeof elevationSetSettings
  | typeof authSetUser
> = {
  actionCreator: [
    routePlannerColorizeBy,
    routePlannerSetResult,
    routePlannerSetActiveAlternativeIndex,
    elevationSetSettings,
    // Signing in or out drops the render line (it's sampled per premium status)
    // and can unlock a premium mode, so rebuild it right away.
    authSetUser,
  ],
  // Only the smoothing windows reset the cache below; the steepness window is
  // measured off the drawn points, so it rebuilds nothing.
  actionPredicate: (action) =>
    !elevationSetSettings.match(action) ||
    affectsElevationSmoothing(action.payload),
  handle: async ({ dispatch, getState }) => {
    const colorizeBy = unlockedColorizingMode(
      getState().routePlannerSettings.colorizeBy,
      isPremium(getState().auth.user),
    );

    // Elevation-derived modes need the densified DEM render line; it's cached
    // so switching between them refetches nothing. A new result, a different
    // alternative or changed elevation settings reset that cache, so rebuild it
    // while the mode stays applied — the chart's own refresh can't be relied on
    // here, as it does nothing while the chart is closed. Other modes (e.g.
    // heading) read the route coordinates directly.
    if (colorizeBy && colorizerNeedsElevation(colorizeBy)) {
      await ensureRouteRenderGeojson(getState, dispatch);
    }
  },
};
