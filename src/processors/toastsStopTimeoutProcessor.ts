import { timeoutMap } from 'fm3/processors/toasts';
import { Processor } from 'fm3/middlewares/processorMiddleware';
import { toastsStopTimeout } from 'fm3/actions/toastsActions';

export const toastsStopTimeoutProcessor: Processor<
  typeof toastsStopTimeout
> = {
  actionCreator: toastsStopTimeout,
  handle: async ({ action: { payload: id } }) => {
    const tm = timeoutMap.get(id);
    if (tm) {
      clearTimeout(tm.timeoutId);
      tm.timeoutId = null as any; // TODO fix
    }
  },
};
