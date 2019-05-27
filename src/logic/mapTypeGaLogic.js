import { createLogic } from 'redux-logic';

import * as at from 'fm3/actionTypes';

let prevMapType;
let prevOverlays = [];

export default createLogic({
  type: [at.MAP_REFOCUS, at.ENABLE_UPDATING_URL /* any initial action */],
  process({ getState }, dispatch, done) {
    const {
      map: { mapType, overlays },
    } = getState();
    if (prevMapType !== mapType) {
      window.ga('set', 'dimension1', mapType);
      window.ga('send', 'event', 'Map', 'setMapType', mapType);
      prevMapType = mapType;
    }
    if ([...prevOverlays].sort().join(',') !== [...overlays].sort().join(',')) {
      window.ga('send', 'event', 'Map', 'setOverlays', overlays);
      prevOverlays = overlays;
    }
    done();
  },
});
