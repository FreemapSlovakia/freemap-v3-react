import {
  routePlannerSetStart,
  routePlannerSetFinish,
  routePlannerSetFromCurrentPosition,
} from 'fm3/actions/routePlannerActions';
import { Processor } from 'fm3/middlewares/processorMiddleware';
import { getCurrentPosition } from 'fm3/geoutils';

export const routePlannerSetFromCurrentPositionProcessor: Processor<typeof routePlannerSetFromCurrentPosition> = {
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
