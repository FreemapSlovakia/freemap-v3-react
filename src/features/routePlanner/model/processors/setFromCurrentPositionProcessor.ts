import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { getCurrentPosition } from '@shared/geoutils.js';
import { loadRoutePlannerMessages } from '../../translations/loadRoutePlannerMessages.js';
import {
  routePlannerSetFinish,
  routePlannerSetFromCurrentPosition,
  routePlannerSetStart,
} from '../actions.js';

export const routePlannerSetFromCurrentPositionProcessor: Processor<
  typeof routePlannerSetFromCurrentPosition
> = {
  actionCreator: routePlannerSetFromCurrentPosition,
  handle: async ({ dispatch, action }) => {
    const position = await getCurrentPosition().catch(() => {
      dispatch(
        toastsAdd({
          // Transient/user-controllable geolocation failure, not an app error.
          id: 'routePlanner.gpsError',
          messageKey: 'gpsError',
          messageLoader: loadRoutePlannerMessages,
          style: 'warning',
          timeout: 5000,
        }),
      );
    });

    if (!position) {
      return;
    }

    const { lat, lon } = position;

    if (action.payload === 'start') {
      dispatch(routePlannerSetStart({ lat, lon }));
    } else {
      dispatch(routePlannerSetFinish({ lat, lon }));
    }
  },
};
