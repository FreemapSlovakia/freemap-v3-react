import { toggleLocate } from 'fm3/actions/mainActions';
import { getMapLeafletElement } from 'fm3/leafletElementHolder';
import { Processor } from 'fm3/middlewares/processorMiddleware';

export const locateProcessor: Processor = {
  actionCreator: toggleLocate,
  handle: async ({ getState }) => {
    const leafletElement = getMapLeafletElement();
    if (leafletElement) {
      // may not exist yet when we start with ?tool=track-viewer
      if (getState().main.locate) {
        leafletElement.locate({ setView: true, maxZoom: 16, watch: true });
      } else {
        leafletElement.stopLocate();
      }
    }
  },
};
