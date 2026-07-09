import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { cancelRegister, cancelTriggered } from '@shared/cancelRegister.js';

export const cancelProcessor: Processor = {
  async handle({ action, prevState, getState }) {
    const state = getState();

    for (const item of cancelRegister) {
      if (cancelTriggered(item, action, prevState, state)) {
        item.cancel(`Canceled by ${action.type} action`);
      }
    }
  },
};
