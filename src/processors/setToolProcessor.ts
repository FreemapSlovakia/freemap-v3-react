import { setTool } from '@app/store/actions.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { isDrawTool } from '@shared/toolDefinitions.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import storage from 'local-storage-fallback';

export const setToolProcessor: Processor<typeof setTool> = {
  actionCreator: setTool,
  async handle({ action, getState }) {
    const { tool, mode } = action.payload;

    if (mode === 'close') {
      return;
    }

    trackMatomo(['trackEvent', 'Tool', 'set', tool]);

    if (
      getState().cookieConsent.cookieConsentResult !== null &&
      isDrawTool(tool)
    ) {
      storage.setItem('fm.drawingTool', tool);
    }
  },
};
