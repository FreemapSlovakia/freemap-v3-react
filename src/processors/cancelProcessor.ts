import { cancelRegister } from 'fm3/cancelRegister';
import { Processor } from 'fm3/middlewares/processorMiddleware';

export const cancelProcessor: Processor = {
  async handle({ action }) {
    for (const { cancelActions, cancel } of cancelRegister) {
      for (const cancelAction of cancelActions) {
        if (cancelAction.match(action)) {
          cancel();

          break;
        }
      }
    }
  },
};
