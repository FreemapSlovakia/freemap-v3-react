import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { cancelRegister } from '../cancelRegister.js';

export const cancelProcessor: Processor = {
  async handle({ action }) {
    for (const { cancelActions, cancel } of cancelRegister) {
      for (const cancelAction of cancelActions) {
        if (cancelAction.match(action)) {
          cancel('Canceled by ' + action.type + ' action');

          break;
        }
      }
    }
  },
};
