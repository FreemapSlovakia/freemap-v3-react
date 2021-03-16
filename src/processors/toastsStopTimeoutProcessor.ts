import { toastsStopTimeout } from 'fm3/actions/toastsActions';
import { Processor } from 'fm3/middlewares/processorMiddleware';
import { timeoutMap } from 'fm3/processors/toasts';

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
