import { getMapLeafletElement } from 'fm3/leafletElementHolder';
import { setActiveModal, exportPdf } from 'fm3/actions/mainActions';
import { Processor } from 'fm3/middlewares/processorMiddleware';

export const exportPdfProcessor: Processor<typeof exportPdf> = {
  actionCreator: exportPdf,
  handle: async ({ dispatch, getState, action }) => {
    const le = getMapLeafletElement();
    if (!le) {
      return;
    }

    const {
      scale,
      area,
      shadedRelief,
      contours,
      hikingTrails,
      bicycleTrails,
      skiTrails,
      horseTrails,
    } = action.payload;

    let w: number | undefined = undefined;
    let n: number | undefined = undefined;
    let e: number | undefined = undefined;
    let s: number | undefined = undefined;

    if (area === 'visible') {
      const bounds = le.getBounds();
      w = bounds.getWest();
      n = bounds.getNorth();
      e = bounds.getEast();
      s = bounds.getSouth();
    } else {
      // infopoints
      for (const { lat, lon } of getState().drawingPoints.points) {
        w = Math.min(w === undefined ? 1000 : w, lon);
        n = Math.max(n === undefined ? -1000 : n, lat);
        e = Math.max(e === undefined ? -1000 : e, lon);
        s = Math.min(s === undefined ? 1000 : s, lat);
      }
    }

    window.open(
      `https://outdoor.tiles.freemap.sk/pdf?zoom=${getState().map.zoom}` +
        `&bbox=${w},${s},${e},${n}&scale=${scale}` +
        `&hikingTrails=${hikingTrails}&bicycleTrails=${bicycleTrails}&skiTrails=${skiTrails}&horseTrails=${horseTrails}&shading=${shadedRelief}&contours=${contours}`,
    );
    dispatch(setActiveModal(null));
  },
};
