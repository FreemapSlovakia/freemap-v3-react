import { createLogic } from 'redux-logic';
import { searchSetResults } from 'fm3/actions/searchActions';
import { startProgress, stopProgress } from 'fm3/actions/mainActions';

export default createLogic({
  type: 'SEARCH_SET_QUERY',
  process({ getState }, dispatch, done) {
    const { query } = getState().search;
    if (!query) {
      done();
      return;
    }

    const { lat, lon, zoom } = getState().map;

    // `https://www.freemap.sk/api/0.1/q/${encodeURIComponent(searchQuery)}&lat=${lat}&lon=${lon}&zoom=${zoom}`

    dispatch(startProgress());
    fetch(`//nominatim.openstreetmap.org/search/${encodeURIComponent(query)}`
        + `?format=jsonv2&lat=${lat}&lon=${lon}&zoom=${zoom}&namedetails=1&extratags=1&countrycodes=SK&polygon_geojson=1`)
      .then(res => res.json())
      .then(data => {
        const results = data.map((d, id) => {
          const name = d.namedetails.name;
          const tags = { name, type: d.type };
          return { id, label: name, geojson: d.geojson, lat: parseFloat(d.lat), lon: parseFloat(d.lon), tags };
        });
        dispatch(searchSetResults(results));
      })
      .catch(() => {})
      .then(() => {
        dispatch(stopProgress());
        done();
      });
  }
});