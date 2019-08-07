import { setupTimeout, removeTimeout } from 'fm3/processors/toasts';
import { IProcessor } from 'fm3/middlewares/processorMiddleware';
import { toastsAdd } from 'fm3/actions/toastsActions';

export const toastsAddProcessor: IProcessor<typeof toastsAdd> = {
  actionCreator: toastsAdd,
  handle: async ({ dispatch, getState, action }) => {
    const {
      payload: { timeout, id, collapseKey },
    } = action;

    if (collapseKey) {
      const toast = getState().toasts.toasts.find(
        t => t.collapseKey === collapseKey,
      );
      if (toast) {
        removeTimeout(toast.id);
      }
    }

    if (typeof timeout === 'number') {
      setupTimeout(id, timeout, dispatch);
    }
  },
};
