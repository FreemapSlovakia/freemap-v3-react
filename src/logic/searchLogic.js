import { createLogic } from 'redux-logic';
import { setResults } from 'fm3/actions/searchActions';
import { refocusMap } from 'fm3/actions/mapActions';

const searchLogic = createLogic({
  type: 'SEARCH',
  process({ getState }, dispatch, done) {
    const { center, zoom } = getState().map;
    const lat = center.lat;
    const lon = center.lon;
    const { query } = getState().search;
    if (!query) {
      return null;
    }
    
    const url = `https://nominatim.openstreetmap.org/search/${encodeURIComponent(query)}`
        + `?format=jsonv2&lat=${lat}&lon=${lon}&zoom=${zoom}&namedetails=1&extratags=1&countrycodes=SK&polygon_geojson=1`;
    // fetch(`https://www.freemap.sk/api/0.1/q/${encodeURIComponent(searchQuery)}&lat=${lat}&lon=${lon}&zoom=${zoom}`, {
    fetch(url, { method: 'GET' }).then(res => res.json()).then(data => {
      const results = data.map((d, id) => {
        const name = d.namedetails.name;
        const tags = { name, type: d.type };
        return { id, label: name, geojson: d.geojson, lat: parseFloat(d.lat), lon: parseFloat(d.lon), tags };
      });
      dispatch(setResults(results));
    }).catch(() => {}).then(() => done());
  }
});

const refocusMapLogic = createLogic({
  type: 'HIGHLIGHT_RESULT',
  process({ getState }, dispatch) {
    const { highlightedResult } = getState().search;
    const { zoom, bounds } = getState().map;
    
    if (highlightedResult && bounds) {
      const southWest = L.latLng(bounds.south, bounds.west);
      const northEast = L.latLng(bounds.north, bounds.east);
      const leafletBounds = L.latLngBounds(southWest, northEast);
      const hLatLon = L.latLng(highlightedResult.lat, highlightedResult.lon);
      if (zoom < 13 || !leafletBounds.contains(hLatLon)) {
        dispatch(refocusMap(highlightedResult.lat, highlightedResult.lon, 13));
      }
    }
  }
});

export default [
  searchLogic,
  refocusMapLogic
];