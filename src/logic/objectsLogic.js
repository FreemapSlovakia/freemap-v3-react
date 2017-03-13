import { createLogic } from 'redux-logic';
import { setObjects } from 'fm3/actions/objectsActions';

export default createLogic({
  type: 'SET_OBJECTS_FILTER',
  process({ getState, action: { filter } }, dispatch, done) {
    const { south, west, north, east } = getState().map.bounds;
    const bbox = `${south},${west},${north},${east}`;
    const query = `[out:json][timeout:60]; ${filter.replace('{{bbox}}', bbox)}; out qt;`;

    fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: `data=${encodeURIComponent(query)}`
    })
      .then(res => res.json()).then(data => {
        dispatch(setObjects(data.elements.map((d, id) => ({ id, lat: d.lat, lon: d.lon, tags: d.tags }))));
      })
      .catch(() => {})
      .then(() => done());
  }
});
