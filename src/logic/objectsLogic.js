import { createLogic } from 'redux-logic';
import { setObjects, cancelObjectsModal, setCategories, setSubcategories } from 'fm3/actions/objectsActions';

const logic1 = createLogic({
  type: 'SET_OBJECTS_FILTER',
  process({ getState, action: { filter } }, dispatch, done) {
    if (!filter || !filter.length) {
      dispatch(cancelObjectsModal());
      done();
      return;
    }

    const { south, west, north, east } = getState().map.bounds;

    const bbox = `(${south},${west},${north},${east})`;
    const query = `[out:json][timeout:60]; (${filter.map(f => `${f}${bbox};`).join('')}); out qt;`;

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

const logic2 = createLogic({
  type: 'SHOW_OBJECTS_MODAL',
  process({ getState, action: { filter } }, dispatch, done) {
    // TODO read only once, then use from the store

    const p1 = fetch('https://dev.freemap.sk/api/0.3/poi/categories', {
      method: 'GET'
    }).then(res => res.json()).then(data => {
      dispatch(setCategories(data)); // id, name (missing category_icon,)
    });

    const p2 = fetch('https://dev.freemap.sk/api/0.3/poi/subcategories', {
      method: 'GET'
    }).then(res => res.json()).then(data => {
      dispatch(setSubcategories(data)); // id, category_id, name, category_icon (no need), subcategory_icon
    });

    return Promise.all([ p1, p2 ]).catch(() => {}).then(() => done());
  }
});

export default [ logic1, logic2 ];
