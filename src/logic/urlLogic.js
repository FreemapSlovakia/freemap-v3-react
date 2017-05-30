import { createLogic } from 'redux-logic';
import history from 'fm3/history';

export const urlLogic = createLogic({
  type: ['MAP_REFOCUS', /^ROUTE_PLANNER_/, 'SET_TOOL', 'SET_EMBEDDED_MODE'],
  process({ getState }, dispatch, done) {
    const {
      map: { mapType, overlays, zoom, lat, lon },
      main: { embeddedMode, tool },
      routePlanner: { start, finish, midpoints, transportType },
      trackViewer: { trackUID },
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

    if (tool === 'track-viewer' && trackUID) {
      queryParts.push(
        `tool=${tool}`,
        `track-uid=${trackUID}`,
      );
    }

    if (embeddedMode) {
      queryParts.push('embed=true');
    }

    history.replace({
      search: `?${queryParts.join('&')}`,
    });

    done();
  },
});

export default urlLogic;
