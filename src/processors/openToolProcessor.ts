import { openTool } from '@app/store/actions.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { trackMatomo } from '@shared/trackMatomo.js';

export const openToolProcessor: Processor<typeof openTool> = {
  actionCreator: openTool,
  async handle({ action }) {
    trackMatomo(['trackEvent', 'Tool', 'set', action.payload]);
  },
};
