import { toastsRemove } from '../actions/toastsActions.js';
import type { Processor } from '../middlewares/processorMiddleware.js';
import { removeTimeout } from '../processors/toasts.js';

export const toastsRemoveProcessor: Processor<typeof toastsRemove> = {
  actionCreator: toastsRemove,
  handle: async ({ action: { payload: id } }) => {
    removeTimeout(id);
  },
};
