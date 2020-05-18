import { setupTimeout, removeTimeout } from 'fm3/processors/toasts';
import { Processor } from 'fm3/middlewares/processorMiddleware';
import { toastsAdd } from 'fm3/actions/toastsActions';

export const toastsAddProcessor: Processor<typeof toastsAdd> = {
  actionCreator: toastsAdd,
  handle: async ({ dispatch, getState, action }) => {
    const {
      payload: { timeout, id },
    } = action;

    const toast = getState().toasts.toasts.find((t) => t.id === id);

    if (toast) {
      removeTimeout(toast.id);
    }

    if (typeof timeout === 'number') {
      setupTimeout(id, timeout, dispatch);
    }
  },
};
