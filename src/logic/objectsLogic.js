import { createLogic } from 'redux-logic';

import { getMapLeafletElement } from 'fm3/leafletElementHolder';
import { getPoiType } from 'fm3/poiTypes';
import { exportGpx, createElement } from 'fm3/gpxExporter';

import { objectsSetResult } from 'fm3/actions/objectsActions';
import { startProgress, stopProgress } from 'fm3/actions/mainActions';
import { toastsAddError } from 'fm3/actions/toastsActions';

export const objectsFetchLogic = createLogic({
  type: 'OBJECTS_SET_FILTER',
  cancelType: ['OBJECTS_SET_FILTER', 'SET_TOOL', 'MAP_RESET'],
  process({ action: { payload }, cancelled$ }, dispatch, done) {
    const b = getMapLeafletElement().getBounds();
    const bbox = `${b.getSouth()},${b.getWest()},${b.getNorth()},${b.getEast()}`;

    const poiType = getPoiType(payload);

    const query = `[out:json][timeout:60]; ${poiType.overpassFilter.replace(/\{\{bbox\}\}/g, bbox)}; out center;`;

    const pid = Math.random();
    dispatch(startProgress(pid));
    cancelled$.subscribe(() => {
      dispatch(stopProgress(pid));
    });

    fetch('//overpass-api.de/api/interpreter', {
      method: 'POST',
      body: `data=${encodeURIComponent(query)}`,
    })
      .then(res => res.json()).then((data) => {
        const result = data.elements.map(({ id, center, tags, lat, lon }) => ({
          id,
          lat: center && center.lat || lat,
          lon: center && center.lon || lon,
          tags,
          typeId: payload,
        }));
        dispatch(objectsSetResult(result));
      })
      .catch((e) => {
        dispatch(toastsAddError(`Nastala chyba pri získavani objektov: ${e.message}`));
      })
      .then(() => {
        dispatch(stopProgress(pid));
        done();
      });
  },
});

export const objectGpxExportLogic = createLogic({
  type: 'OBJECTS_EXPORT_GPX',
  process({ getState }, dispatch, done) {
    exportGpx('miesta', (doc) => {
      getState().objects.objects.forEach(({ lat, lon, tags }) => {
        const wptEle = createElement(doc.documentElement, 'wpt', undefined, { lat, lon });

        if (!isNaN(tags.ele)) {
          createElement(wptEle, 'ele', tags.ele);
        }

        if (tags.name) {
          createElement(wptEle, 'name', tags.name);
        }
      });
    });
    done();
  },
});

export default [objectsFetchLogic, objectGpxExportLogic];
