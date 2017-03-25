import { createLogic } from 'redux-logic';
import FileSaver from 'file-saver';

import { objectsSetResult } from 'fm3/actions/objectsActions';
import { startProgress, stopProgress } from 'fm3/actions/mainActions';
import { getLeafletElement } from 'fm3/leafletElementHolder';
import { getPoiType } from 'fm3/poiTypes';

export const objectsFetchLogic = createLogic({
  type: 'OBJECTS_SET_FILTER',
  process({ getState, action: { payload } }, dispatch, done) {
    const b = getLeafletElement().getBounds();
    const bbox = `${b.getSouth()},${b.getWest()},${b.getNorth()},${b.getEast()}`;

    const poiType = getPoiType(payload);

    const query = `[out:json][timeout:60]; ${poiType.overpassFilter.replace(/\{\{bbox\}\}/g, bbox)}; out center;`;

    dispatch(startProgress());
    fetch('//overpass-api.de/api/interpreter', {
      method: 'POST',
      body: `data=${encodeURIComponent(query)}`
    })
      .then(res => res.json()).then(data => {
        const result = data.elements.map(({ id, center, tags, lat, lon }) => (
          { id, lat: center && center.lat || lat, lon: center && center.lon || lon, tags, typeId: payload })
        );
        dispatch(objectsSetResult(result));
      })
      // .catch(e => console.error(e))
      .then(() => {
        dispatch(stopProgress());
        done();
      });
  }
});

const ns = 'http://www.topografix.com/GPX/1/1';

export const objectGpxExportLogic = createLogic({
  type: 'OBJECTS_EXPORT_GPX',
  process({ getState }, dispatch, done) {
    const doc = document.implementation.createDocument(ns, 'gpx');

    addAttribute(doc.documentElement, 'version', '1.1');
    addAttribute(doc.documentElement, 'creator', 'FreemapV3');

    createElement(doc.documentElement, 'metadata');

    getState().objects.objects.forEach(({ lat, lon, tags }) => {
      const wptEle = createElement(doc.documentElement, 'wpt', undefined, { lat, lon });

      if (!isNaN(tags.ele)) {
        createElement(wptEle, 'ele', tags.ele);
      }

      if (tags.name) {
        createElement(wptEle, 'name', tags.name);
      }
    });

    const serializer = new XMLSerializer();
    // eslint-disable-next-line
    console.log(serializer.serializeToString(doc));

    FileSaver.saveAs(new Blob([ serializer.serializeToString(doc) ], { type: 'application/json' }), 'miesta.gpx');

    done();
  }
});

function createElement(parent, name, text, attributes = {}) {
  const elem = document.createElementNS(ns, name);
  if (text !== undefined) {
    elem.textContent = text;
  }

  Object.keys(attributes).forEach(key => addAttribute(elem, key, attributes[key]));

  parent.appendChild(elem);
  return elem;
}

function addAttribute(elem, name, value) {
  const attr = document.createAttribute(name);
  attr.value = value;
  elem.setAttributeNode(attr);
}

export default [ objectsFetchLogic, objectGpxExportLogic ];
