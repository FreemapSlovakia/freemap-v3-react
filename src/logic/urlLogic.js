import { createLogic } from 'redux-logic';
import history from 'fm3/history';

export const urlLogic = createLogic({
  type: ['MAP_REFOCUS', /^ROUTE_PLANNER_/, 'SET_TOOL'],
  process({ getState }, dispatch, done) {
    const {
      map: { mapType, overlays, zoom, lat, lon },
      main: { tool },
      routePlanner: { start, finish, midpoints, transportType },
    } = getState();

    const queryParts = [
      `map=${zoom}/${lat.toFixed(5)}/${lon.toFixed(5)}`,
      `layers=${mapType}${overlays.join('')}`,
    ];

    if (tool === 'route-planner' && start && finish) {
      queryParts.push(
        `tool=${tool}`,
        `transport=${transportType}`,
        `points=${[start, ...midpoints, finish].map(point => `${point.lat.toFixed(5)}/${point.lon.toFixed(5)}`).join(',')}`,
      );
    }

    history.replace({
      search: `?${queryParts.join('&')}`,
    });

    done();
  },
});

export default urlLogic;
