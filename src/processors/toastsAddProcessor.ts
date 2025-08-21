import { toastsAdd } from '../actions/toastsActions.js';
import type { Processor } from '../middlewares/processorMiddleware.js';
import { removeTimeout, setupTimeout } from '../processors/toasts.js';

export const toastsAddProcessor: Processor<typeof toastsAdd> = {
  actionCreator: toastsAdd,
  handle: async ({ dispatch, getState, action }) => {
    const {
      payload: { timeout, id },
    } = action;

    const toast = getState().toasts.toasts[id];

    if (toast) {
      removeTimeout(toast.id);
    }

    if (typeof timeout === 'number') {
      setupTimeout(id, timeout, dispatch);
    }
  },
};
