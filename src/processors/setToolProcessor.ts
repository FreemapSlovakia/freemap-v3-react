import { setActiveModal, setTool } from 'fm3/actions/mainActions';
import { Processor } from 'fm3/middlewares/processorMiddleware';

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
    }
  },
};
