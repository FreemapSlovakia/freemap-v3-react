import { toastsStopTimeout } from '../actions/toastsActions.js';
import type { Processor } from '../middlewares/processorMiddleware.js';
import { timeoutMap } from '../processors/toasts.js';

export const toastsStopTimeoutProcessor: Processor<typeof toastsStopTimeout> = {
  actionCreator: toastsStopTimeout,
  handle: async ({ action: { payload: id } }) => {
    const tm = timeoutMap.get(id);

    if (tm?.timeoutId != null) {
      clearTimeout(tm.timeoutId);

      tm.timeoutId = null;
    }
  },
};
