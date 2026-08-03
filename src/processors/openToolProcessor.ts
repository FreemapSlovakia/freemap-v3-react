import { openTool } from '@app/store/actions.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { isDrawTool } from '@shared/toolDefinitions.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import storage from 'local-storage-fallback';

export const openToolProcessor: Processor<typeof openTool> = {
  actionCreator: openTool,
  async handle({ action, getState }) {
    const tool = action.payload;

    trackMatomo(['trackEvent', 'Tool', 'set', tool]);

    if (
      getState().cookieConsent.cookieConsentResult !== null &&
      isDrawTool(tool)
    ) {
      storage.setItem('fm.drawingTool', tool);
    }
  },
};
