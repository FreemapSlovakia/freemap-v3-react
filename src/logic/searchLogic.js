import { createLogic } from 'redux-logic';

export default createLogic({
  type: 'SEARCH',
  process({ getState }, dispatch, done) {
    const {center, zoom} = getState().map;
    const lat = center.lat;
    const lon = center.lon;
    const {query} = getState().search;
    if (!query) {
      return null;
    }
    
    const url = `https://nominatim.openstreetmap.org/search/${encodeURIComponent(query)}`
        + `?format=jsonv2&lat=${lat}&lon=${lon}&zoom=${zoom}&namedetails=1&extratags=1&countrycodes=SK`;
    // fetch(`https://www.freemap.sk/api/0.1/q/${encodeURIComponent(searchQuery)}&lat=${lat}&lon=${lon}&zoom=${zoom}`, {
    fetch(url, { method: 'GET' }).then(res => res.json()).then(data => {
      const results = data.map((d, id) => {
        const name = d.namedetails.name;
        const tags = { name, type: d.type };
        return { id, label: name, lat: parseFloat(d.lat), lon: parseFloat(d.lon), tags };
      });
      dispatch({ type: 'SET_RESULTS',  results });
    }).catch(() => {}).then(() => done());
  }
});
