import { createLogic } from 'redux-logic';
import { hashHistory as history } from 'react-router';

export default createLogic({
  type: [
    'RESET_MAP',
    'REFOCUS',
    'SET_MAP_BOUNDS',
    'SET_MAP_TYPE',
    'SET_MAP_OVERLAYS'
  ],
  process({ getState }) {
    const { zoom, center, mapType, overlays } = getState().map;
    const lat = center.lat;
    const lon = center.lon;
    const newUrl = `/${mapType}${overlays.join('')}/${zoom}/${lat.toFixed(6)}/${lon.toFixed(6)}`;
    history.replace(newUrl);
  }
});
