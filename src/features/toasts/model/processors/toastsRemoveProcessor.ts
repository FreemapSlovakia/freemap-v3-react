import { toastsRemove } from '../actions.js';
import type { Processor } from '../../../../middlewares/processorMiddleware.js';
import { removeTimeout } from './toasts.js';

export const toastsRemoveProcessor: Processor<typeof toastsRemove> = {
  actionCreator: toastsRemove,
  handle: async ({ action: { payload: id } }) => {
    removeTimeout(id);
  },
};
