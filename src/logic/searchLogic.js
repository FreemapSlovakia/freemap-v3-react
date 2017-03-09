import { createLogic } from 'redux-logic';
import { setResults } from 'fm3/actions/searchActions';
import { refocusMap, setTool } from 'fm3/actions/mapActions';

const searchLogic = createLogic({
  type: 'SEARCH',
  process({ getState }, dispatch, done) {
    const { query } = getState().search;
    if (!query) {
      done();
      return;
    }

    const { center: { lat, lon }, zoom } = getState().map;

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
    const { search: { highlightedResult }, map: { zoom, bounds } } = getState();

    if (highlightedResult && bounds) {
      const southWest = L.latLng(bounds.south, bounds.west);
      const northEast = L.latLng(bounds.north, bounds.east);
      const leafletBounds = L.latLngBounds(southWest, northEast);
      const hLatLon = L.latLng(highlightedResult.lat, highlightedResult.lon);
      if (zoom < 13 || !leafletBounds.contains(hLatLon)) {
        return dispatch(refocusMap(highlightedResult.lat, highlightedResult.lon, 13));
      }
    }
  }
});

const setToolLogic = createLogic({
  type: 'SELECT_RESULT',
  process({ getState }, dispatch) {
    const selectedResult = getState().search.selectedResult;
    const tool = selectedResult ? 'search' : null;

    // FIXME: this is a hack to avoid Warning: setState(...): Can only update a mounted or mounting component. This usually means you called setState() on an unmounted component. This is a no-op. Please check the code for the ReactClass component.
    setTimeout(() => {
      return dispatch(setTool(tool));
    }, 100);
  }
});


export default [
  searchLogic,
  refocusMapLogic,
  setToolLogic
];
