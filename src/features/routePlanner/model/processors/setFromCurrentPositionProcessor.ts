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
  handle: async ({ dispatch, getState, action }) => {
    let position;

    try {
      position = await getCurrentPosition();
    } catch {
      const rpm = await loadRoutePlannerMessages(getState().l10n.language);

      dispatch(
        toastsAdd({
          id: 'routePlanner.gpsError',
          message: rpm.gpsError,
          style: 'danger',
          timeout: 5000,
        }),
      );

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
