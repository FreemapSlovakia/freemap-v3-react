import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { toastsRemove } from '../actions.js';
import { removeTimeout } from './toasts.js';

export const toastsRemoveProcessor: Processor<typeof toastsRemove> = {
  actionCreator: toastsRemove,
  handle: async ({ action: { payload: id } }) => {
    removeTimeout(id);
  },
};
