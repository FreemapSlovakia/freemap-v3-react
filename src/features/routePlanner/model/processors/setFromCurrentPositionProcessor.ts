import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { getCurrentPosition } from '@shared/geoutils.js';
import {
  routePlannerSetFinish,
  routePlannerSetFromCurrentPosition,
  routePlannerSetStart,
} from '../actions.js';

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
