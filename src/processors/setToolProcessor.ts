import storage from 'local-storage-fallback';
import { setActiveModal, setTool } from '../actions/mainActions.js';
import type { Processor } from '../middlewares/processorMiddleware.js';

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
        getState().main.cookieConsentResult !== null &&
        tool.startsWith('draw-')
      ) {
        storage.setItem('drawingTool', tool);
      }
    }
  },
};
