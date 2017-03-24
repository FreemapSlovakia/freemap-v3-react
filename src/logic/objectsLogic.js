import { createLogic } from 'redux-logic';
import { objectsSetResult } from 'fm3/actions/objectsActions';
import { startProgress, stopProgress } from 'fm3/actions/mainActions';
import { getLeafletElement } from 'fm3/leafletElementHolder';
import { getPoiType } from 'fm3/poiTypes';

export default createLogic({
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
      .catch(e => console.error(e))
      .then(() => {
        dispatch(stopProgress());
        done();
      });
  }
});
