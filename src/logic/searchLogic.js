import { createLogic } from 'redux-logic';
import { searchSetResults } from 'fm3/actions/searchActions';
import { startProgress, stopProgress } from 'fm3/actions/mainActions';
import toastEmitter from 'fm3/emitters/toastEmitter';

export default createLogic({
  type: 'SEARCH_SET_QUERY',
  cancelType: ['SEARCH_SET_QUERY', 'SET_TOOL'],
  process({ getState }, dispatch, done) {
    const { query } = getState().search;
    if (!query) {
      done();
      return;
    }

    dispatch(startProgress());
    fetch(`//www.freemap.sk/api/0.3/searchhint/${encodeURIComponent(query)}&max_count=10`)
      .then(res => res.json())
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
        toastEmitter.emit('showToast', 'error', 'Nastala chyba pri spracovaní výsledkov vyhľadávania', e.toString());
      })
      .then(() => {
        dispatch(stopProgress());
        done();
      });
  },
});
