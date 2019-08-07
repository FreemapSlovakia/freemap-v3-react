import { removeTimeout } from 'fm3/processors/toasts';
import { IProcessor } from 'fm3/middlewares/processorMiddleware';
import { toastsRemove } from 'fm3/actions/toastsActions';

export const toastsRemoveProcessor: IProcessor<typeof toastsRemove> = {
  actionCreator: toastsRemove,
  handle: async ({ action: { payload: id } }) => {
    removeTimeout(id);
  },
};
