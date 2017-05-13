import { createLogic } from 'redux-logic';
import { getMapLeafletElement } from 'fm3/leafletElementHolder';

export default createLogic({
  type: 'SET_TOOL',
  process({ action: { payload } }) {
    const leafletElement = getMapLeafletElement();
    if (leafletElement) { // may not exist yet when we start with ?tool=track-viewer
      if (payload === 'location') {
        leafletElement.locate({ setView: true, maxZoom: 16, watch: true });
      } else {
        leafletElement.stopLocate();
      }
    }
  },
});
