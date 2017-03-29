import { createLogic } from 'redux-logic';
import { getMapLeafletElement } from 'fm3/leafletElementHolder';

export default createLogic({
  type: 'SET_TOOL',
  process({ action: { payload } }) {
    if (payload === 'location') {
      getMapLeafletElement().locate({ setView: true, maxZoom: 16, watch: true });
    } else {
      getMapLeafletElement().stopLocate();
    }
  },
});
