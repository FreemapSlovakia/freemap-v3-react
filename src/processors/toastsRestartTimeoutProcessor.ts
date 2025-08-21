import { toastsRestartTimeout } from '../actions/toastsActions.js';
import type { Processor } from '../middlewares/processorMiddleware.js';
import { setupTimeout, timeoutMap } from '../processors/toasts.js';

export const toastsRestartTimeoutProcessor: Processor<
  typeof toastsRestartTimeout
> = {
  actionCreator: toastsRestartTimeout,
  handle: async ({
    getState,
    action: {
      payload: { id },
    },
  }) => {
    const tm = timeoutMap.get(id);

    if (tm) {
      timeoutMap.delete(id);

      if (tm.timeoutId) {
        clearTimeout(tm.timeoutId);
      }

      const toast = getState().toasts.toasts[id];

      if (toast?.timeout !== undefined) {
        setupTimeout(id, toast.timeout, tm.dispatch);
      }
    }
  },
};
