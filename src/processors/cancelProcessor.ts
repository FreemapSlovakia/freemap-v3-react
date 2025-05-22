import { cancelRegister } from '../cancelRegister.js';
import type { Processor } from '../middlewares/processorMiddleware.js';

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
