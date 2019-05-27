import { createLogic } from 'redux-logic';
import { getMapLeafletElement } from 'fm3/leafletElementHolder';
import * as at from 'fm3/actionTypes';

export default createLogic({
  type: at.LOCATE,
  process({ getState }) {
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
});
