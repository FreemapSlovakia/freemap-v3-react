import { removeTimeout } from 'fm3/processors/toasts';
import { Processor } from 'fm3/middlewares/processorMiddleware';
import { toastsRemove } from 'fm3/actions/toastsActions';

export const toastsRemoveProcessor: Processor<typeof toastsRemove> = {
  actionCreator: toastsRemove,
  handle: async ({ action: { payload: id } }) => {
    removeTimeout(id);
  },
};
