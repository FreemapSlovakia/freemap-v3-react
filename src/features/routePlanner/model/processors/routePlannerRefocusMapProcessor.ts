import { mapRefocus } from '../../../map/model/actions.js';
import { routePlannerSetFinish, routePlannerSetStart } from '../actions.js';
import { mapPromise } from '../../../../leafletElementHolder.js';
import type { Processor } from '../../../../middlewares/processorMiddleware.js';
import type { LatLon } from '../../../../types/common.js';

export const routePlannerRefocusMapProcessor: Processor<
  typeof routePlannerSetStart | typeof routePlannerSetFinish
> = {
  actionCreator: [routePlannerSetStart, routePlannerSetFinish],
  handle: async ({ dispatch, getState, action }) => {
    const {
      routePlanner: { points, finishOnly },
    } = getState();

    let focusPoint: LatLon | undefined;

    if (routePlannerSetStart.match(action)) {
      focusPoint = finishOnly ? undefined : points[0];
    } else if (routePlannerSetFinish.match(action)) {
      focusPoint = points.at(-1);
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
