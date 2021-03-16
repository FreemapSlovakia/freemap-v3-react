import {
  routePlannerSetFinish,
  routePlannerSetFromCurrentPosition,
  routePlannerSetStart,
} from 'fm3/actions/routePlannerActions';
import { getCurrentPosition } from 'fm3/geoutils';
import { Processor } from 'fm3/middlewares/processorMiddleware';

export const routePlannerSetFromCurrentPositionProcessor: Processor<
  typeof routePlannerSetFromCurrentPosition
> = {
  actionCreator: routePlannerSetFromCurrentPosition,
  errorKey: 'routePlanner.gpsError',
  handle: async ({ dispatch, action }) => {
    const { lat, lon } = await getCurrentPosition();

    if (action.payload === 'start') {
      dispatch(routePlannerSetStart({ start: { lat, lon } }));
    } else {
      dispatch(routePlannerSetFinish({ finish: { lat, lon } }));
    }
  },
};
