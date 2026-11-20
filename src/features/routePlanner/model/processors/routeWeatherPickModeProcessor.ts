import { closeTool, selectFeature } from '@app/store/actions.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { isToolOpen } from '@app/store/selectors.js';
import { routePlannerDelete, routePlannerSetPickMode } from '../actions.js';

/**
 * Closing the route's weather panel deselects, which disarms picking; the
 * picking it was opened beside comes back. Not when something else is
 * selected, which disarms it anyway.
 */
export const routeWeatherPickModeProcessor: Processor<typeof selectFeature> = {
  actionCreator: selectFeature,
  handle: async ({ action, prevState, getState, dispatch }) => {
    const pickMode = prevState.routePlanner.pickMode;

    // Not when the panel went with its tool.
    if (
      prevState.main.selection?.type === 'route-weather' &&
      action.payload === null &&
      pickMode &&
      isToolOpen(getState(), 'route-planner')
    ) {
      dispatch(routePlannerSetPickMode(pickMode));
    }
  },
};

/** The route's weather panel goes with the route, and with its tool. */
export const routeWeatherCloseProcessor: Processor = {
  actionCreator: [routePlannerDelete, closeTool],
  actionPredicate: (action) =>
    !closeTool.match(action) || action.payload === 'route-planner',
  statePredicate: (state) => state.main.selection?.type === 'route-weather',
  handle: async ({ dispatch }) => {
    dispatch(selectFeature(null));
  },
};
