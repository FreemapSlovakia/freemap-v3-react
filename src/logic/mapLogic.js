import { createLogic } from 'redux-logic';
import history from 'fm3/history';

export const mapRefocusLogic = createLogic({
  type: 'MAP_REFOCUS',
  process({ getState }, dispatch, done) {
    const { mapType, overlays, zoom, lat, lon } = getState().map;
    history.replace({
      search: `?map=${zoom}/${lat.toFixed(5)}/${lon.toFixed(5)}&layers=${mapType}${overlays.join('')}`,
    });

    done();
  },
});

export default mapRefocusLogic;
