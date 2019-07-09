import { getMapLeafletElement } from 'fm3/leafletElementHolder';
import { setActiveModal, exportPdf } from 'fm3/actions/mainActions';
import { Middleware, Dispatch } from 'redux';
import { RootAction } from 'fm3/actions';
import { RootState } from 'fm3/storeCreator';
import { isActionOf } from 'typesafe-actions';

export const pdfExportMiddleware: Middleware<
  {},
  RootState,
  Dispatch<RootAction>
> = ({ dispatch, getState }) => next => (action: RootAction) => {
  next(action);

  if (!isActionOf(exportPdf, action)) {
    return;
  }

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
    for (const { lat, lon } of getState().infoPoint.points) {
      w = Math.min(w === undefined ? 1000 : w, lon);
      n = Math.max(n === undefined ? -1000 : n, lat);
      e = Math.max(e === undefined ? -1000 : e, lon);
      s = Math.min(s === undefined ? 1000 : s, lat);
    }
  }

  window.open(
    `https://outdoor.tiles.freemap.sk/pdf?zoom=${getState().map.zoom}` +
      `&bbox=${w},${s},${e},${n}&scale=${scale}` +
      `&hikingTrails=${hikingTrails}&bicycleTrails=${bicycleTrails}&skiTrails=${skiTrails}&shading=${shadedRelief}&contours=${contours}`,
  );
  dispatch(setActiveModal(null));
};
