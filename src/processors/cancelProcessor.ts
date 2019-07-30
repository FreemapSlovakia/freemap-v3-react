import { IProcessor } from 'fm3/middlewares/processorMiddleware';
import { cancelRegister } from 'fm3/authAxios';

export const cancelProcessor: IProcessor = {
  actionCreator: '*',
  handle: async ({ action }) => {
    for (const x of cancelRegister) {
      for (const a of x.cancelActions) {
        if (action.type === a.type) {
          x.source.cancel();
          break;
        }
      }
    }
  },
};
