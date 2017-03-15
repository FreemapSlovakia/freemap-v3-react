import { createLogic } from 'redux-logic';
import { setResults } from 'fm3/actions/searchActions';
import { refocusMap } from 'fm3/actions/mapActions';

const searchLogic = createLogic({
  type: 'SEARCH',
  process({ getState }, dispatch, done) {
    const { query } = getState().search;
    if (!query) {
      done();
      return;
    }

    const { lat, lon, zoom } = getState().map;

    // `https://www.freemap.sk/api/0.1/q/${encodeURIComponent(searchQuery)}&lat=${lat}&lon=${lon}&zoom=${zoom}`

    fetch(`https://nominatim.openstreetmap.org/search/${encodeURIComponent(query)}`
        + `?format=jsonv2&lat=${lat}&lon=${lon}&zoom=${zoom}&namedetails=1&extratags=1&countrycodes=SK&polygon_geojson=1`)
      .then(res => res.json())
      .then(data => {
        const results = data.map((d, id) => {
          const name = d.namedetails.name;
          const tags = { name, type: d.type };
          return { id, label: name, geojson: d.geojson, lat: parseFloat(d.lat), lon: parseFloat(d.lon), tags };
        });
        dispatch(setResults(results));
      })
      .catch(() => {})
      .then(() => done());
  }
});

const refocusMapLogic = createLogic({
  type: 'HIGHLIGHT_RESULT',
  process({ getState }, dispatch) {
    const { search: { highlightedResult }, map: { zoom, bounds: { south, west, north, east } } } = getState();

    if (highlightedResult) {
      const leafletBounds = L.latLngBounds(L.latLng(south, west), L.latLng(north, east));
      const hLatLon = L.latLng(highlightedResult.lat, highlightedResult.lon);
      if (zoom < 13 || !leafletBounds.contains(hLatLon)) { // TODO refactor to use geoutils.isInside
        dispatch(refocusMap({ lat: highlightedResult.lat, lon: highlightedResult.lon, zoom: 13 }));
      }
    }
  }
});

export default [
  searchLogic,
  refocusMapLogic
];
