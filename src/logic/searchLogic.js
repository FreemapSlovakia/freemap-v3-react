import { createLogic } from 'redux-logic';
import { searchSetResults } from 'fm3/actions/searchActions';
import { startProgress, stopProgress } from 'fm3/actions/mainActions';
import { toastsAddError } from 'fm3/actions/toastsActions';

export default createLogic({
  type: 'SEARCH_SET_QUERY',
  cancelType: ['SEARCH_SET_QUERY', 'SET_TOOL', 'MAP_RESET'],
  process({ getState, cancelled$ }, dispatch, done) {
    const { query } = getState().search;
    if (!query) {
      done();
      return;
    }

    const pid = Math.random();
    dispatch(startProgress(pid));
    cancelled$.subscribe(() => {
      dispatch(stopProgress(pid));
    });

    fetch(`//www.freemap.sk/api/0.3/searchhint/${encodeURIComponent(query)}&max_count=10`)
      .then((res) => {
        if (res.status !== 200) {
          throw new Error(`Server vrátil neočakávaný status: ${res.status}`);
        } else {
          return res.json();
        }
      })
      .then((data) => {
        const results = data.results.map((d, id) => {
          const name = d.properties.name;
          const geometryType = d.geometry.type;
          const tags = { name, type: geometryType };
          let centerLonlat;
          if (geometryType === 'Point') {
            centerLonlat = d.geometry.coordinates;
          } else if (geometryType === 'MultiLineString') {
            centerLonlat = d.geometry.coordinates[0][0];
          } else {
            centerLonlat = d.geometry.coordinates[0];
          }
          const centerLat = centerLonlat[1];
          const centerLon = centerLonlat[0];
          return { id, label: name, geojson: d.geometry, lat: centerLat, lon: centerLon, tags };
        });
        dispatch(searchSetResults(results));
      })
      .catch((e) => {
        dispatch(toastsAddError(`Nastala chyba pri spracovaní výsledkov vyhľadávania: ${e.message}`));
      })
      .then(() => {
        dispatch(stopProgress(pid));
        done();
      });
  },
});
