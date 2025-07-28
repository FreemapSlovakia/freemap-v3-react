import {
  routePlannerSetFinish,
  routePlannerSetFromCurrentPosition,
  routePlannerSetStart,
} from '../actions/routePlannerActions.js';
import { getCurrentPosition } from '../geoutils.js';
import type { Processor } from '../middlewares/processorMiddleware.js';

export const routePlannerSetFromCurrentPositionProcessor: Processor<
  typeof routePlannerSetFromCurrentPosition
> = {
  actionCreator: routePlannerSetFromCurrentPosition,
  errorKey: 'routePlanner.gpsError',
  handle: async ({ dispatch, action }) => {
    const { lat, lon } = await getCurrentPosition();

    if (action.payload === 'start') {
      dispatch(routePlannerSetStart({ lat, lon }));
    } else {
      dispatch(routePlannerSetFinish({ lat, lon }));
    }
  },
};
