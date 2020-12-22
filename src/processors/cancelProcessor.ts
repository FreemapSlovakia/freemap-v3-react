import { cancelRegister } from 'fm3/authAxios';
import { Processor } from 'fm3/middlewares/processorMiddleware';
import { isActionOf } from 'typesafe-actions';

export const cancelProcessor: Processor = {
  actionCreator: '*',
  handle: async ({ action }) => {
    for (const x of cancelRegister) {
      for (const a of x.cancelActions) {
        if (isActionOf(a, action)) {
          x.cancel();
          break;
        }
      }
    }
  },
};
