import { mapRefocus } from '../actions/mapActions.js';
import {
  routePlannerSetFinish,
  routePlannerSetStart,
} from '../actions/routePlannerActions.js';
import { mapPromise } from '../leafletElementHolder.js';
import type { Processor } from '../middlewares/processorMiddleware.js';
import type { LatLon } from '../types/common.js';

export const routePlannerRefocusMapProcessor: Processor<
  typeof routePlannerSetStart | typeof routePlannerSetFinish
> = {
  actionCreator: [routePlannerSetStart, routePlannerSetFinish],
  handle: async ({ dispatch, getState, action }) => {
    const {
      routePlanner: { start, finish },
    } = getState();

    let focusPoint: LatLon | null | undefined;

    if (routePlannerSetStart.match(action)) {
      focusPoint = start;
    } else if (routePlannerSetFinish.match(action)) {
      focusPoint = finish;
    }

    if (
      focusPoint &&
      !(await mapPromise)
        .getBounds()
        .contains({ lat: focusPoint.lat, lng: focusPoint.lon })
    ) {
      dispatch(mapRefocus({ lat: focusPoint.lat, lon: focusPoint.lon }));
    }
  },
};
