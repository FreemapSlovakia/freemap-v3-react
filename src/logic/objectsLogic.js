import { createLogic } from 'redux-logic';
import { setObjects } from 'fm3/actions/objectsActions';
import { startProgress, stopProgress } from 'fm3/actions/mainActions';
import { getLeafletElement } from 'fm3/leafletElementHolder';

export default createLogic({
  type: 'SET_OBJECTS_FILTER',
  process({ getState, action: { payload } }, dispatch, done) {

    const b = getLeafletElement().getBounds();

    const bbox = `${b.getSouth()},${b.getWest()},${b.getNorth()},${b.getEast()}`;
    const query = `[out:json][timeout:60]; ${payload.replace('{{bbox}}', bbox)}; out qt;`;

    dispatch(startProgress());
    fetch('//overpass-api.de/api/interpreter', {
      method: 'POST',
      body: `data=${encodeURIComponent(query)}`
    })
      .then(res => res.json()).then(data => {
        dispatch(setObjects(data.elements.map((d, id) => ({ id, lat: d.lat, lon: d.lon, tags: d.tags }))));
      })
      .catch(() => {})
      .then(() => {
        dispatch(stopProgress());
        done();
      });
  }
});
