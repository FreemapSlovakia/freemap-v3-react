import { setActiveModal, setTool } from '@app/store/actions.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import storage from 'local-storage-fallback';

export const setToolProcessor: Processor<typeof setTool> = {
  actionCreator: setTool,
  async handle({ getState, dispatch }) {
    const { tool } = getState().main;

    if (tool) {
      window._paq.push(['trackEvent', 'Main', 'setTool', tool]);

      if (
        tool === 'track-viewer' &&
        !getState().trackViewer.trackGpx &&
        !getState().trackViewer.trackGeojson
      ) {
        dispatch(setActiveModal('upload-track'));
      }

      if (
        getState().cookieConsent.cookieConsentResult !== null &&
        tool.startsWith('draw-')
      ) {
        storage.setItem('fm.drawingTool', tool);
      }
    }
  },
};
