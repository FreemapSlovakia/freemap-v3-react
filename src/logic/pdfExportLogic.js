import { createLogic } from 'redux-logic';

import * as at from 'fm3/actionTypes';
import { getMapLeafletElement } from 'fm3/leafletElementHolder';
import { setActiveModal } from 'fm3/actions/mainActions';

export const pdfExportLogic = createLogic({
  type: at.EXPORT_PDF,
  process({ getState, action }, dispatch, done) {
    const { scale, area, shadedRelief, contours, hikingTrails, bicycleTrails } = action.payload;

    let w;
    let n;
    let e;
    let s;

    if (area === 'visible') {
      const bounds = getMapLeafletElement().getBounds();
      w = bounds.getWest();
      n = bounds.getNorth();
      e = bounds.getEast();
      s = bounds.getSouth();
    } else { // infopoints
      getState().infoPoint.points.forEach(({ lat, lon }) => {
        w = Math.min(w === undefined ? 1000 : w, lon);
        n = Math.max(n === undefined ? -1000 : n, lat);
        e = Math.max(e === undefined ? -1000 : e, lon);
        s = Math.min(s === undefined ? 1000 : s, lat);
      });
    }

    // localhost:4000
    window.open(`http://tiles-ng.freemap.sk/pdf?zoom=${getState().map.zoom}`
      + `&bbox=${w},${s},${e},${n}&scale=${scale}`
      + `&hikingTrails=${hikingTrails}&bicycleTrails=${bicycleTrails}&shading=${shadedRelief}&contours=${contours}`);
    dispatch(setActiveModal(null));
    done();
  },
});

export default pdfExportLogic;
