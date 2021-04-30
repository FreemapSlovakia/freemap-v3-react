import { cancelRegister } from 'fm3/cancelRegister';
import { Processor } from 'fm3/middlewares/processorMiddleware';
import { isActionOf } from 'typesafe-actions';

export const cancelProcessor: Processor = {
  async handle({ action }) {
    for (const { cancelActions, cancel } of cancelRegister) {
      for (const cancelAction of cancelActions) {
        if (isActionOf(cancelAction, action)) {
          cancel();
          break;
        }
      }
    }
  },
};
