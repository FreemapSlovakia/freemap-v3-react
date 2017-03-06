import { createLogic } from 'redux-logic';
import { hashHistory as history } from 'react-router';

export default createLogic({
  type: [ 'SET_MAP_CENTER', 'SET_MAP_ZOOM', 'SET_MAP_TYPE', 'SET_MAP_OVERLAYS' ],
  process({ getState, action }, dispatch, done) {
    const s = Object.assign({}, getState().map, { action }); // TODO ugly
    const { zoom, center: { lat, lon }, mapType, overlays } = s;
    history.replace(`/${mapType}${overlays.join('')}/${zoom}/${lat.toFixed(6)}/${lon.toFixed(6)}`);
    done();
  }
});
