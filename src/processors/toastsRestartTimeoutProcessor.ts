import { timeoutMap, setupTimeout } from 'fm3/processors/toasts';
import { Processor } from 'fm3/middlewares/processorMiddleware';
import { toastsRestartTimeout } from 'fm3/actions/toastsActions';

export const toastsRestartTimeoutProcessor: Processor<typeof toastsRestartTimeout> = {
  actionCreator: toastsRestartTimeout,
  handle: async ({ getState, action: { payload: id } }) => {
    const tm = timeoutMap.get(id);
    if (tm) {
      timeoutMap.delete(id);
      if (tm.timeoutId) {
        clearTimeout(tm.timeoutId);
      }

      const toast = getState().toasts.toasts.find(t => t.id === id);
      if (toast?.timeout != undefined) {
        setupTimeout(id, toast.timeout, tm.dispatch);
      }
    }
  },
};
