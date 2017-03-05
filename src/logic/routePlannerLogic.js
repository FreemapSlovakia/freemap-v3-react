import { createLogic } from 'redux-logic';
import { parseString as xml2js } from 'xml2js';

const freemapTransportTypes = {
  'car': 'motorcar',
  'walk': 'hiking',
  'bicycle': 'bicycle'
};

export default createLogic({
  type: [
    'SET_ROUTE_PLANNER_START',
    'SET_ROUTE_PLANNER_FINISH',
    'ADD_ROUTE_PLANNER_MIDPOINT',
    'SET_ROUTE_PLANNER_MIDPOINT',
    'SET_ROUTE_PLANNER_TRANSPORT_TYPE'
  ],
  process({ getState, action }, dispatch, done) {
    const { start, finish, midpoints, transportType } = getState().routePlanner;
    if (start && finish) {
      const allPoints = [
        [ start.lat, start.lon ].join('%7C'),
        ...midpoints.map(mp => [ mp.lat, mp.lon ].join('%7C')),
        [ finish.lat, finish.lon ].join('%7C')
      ].join('/');

      fetch(`https://www.freemap.sk/api/0.1/r/${allPoints}/${freemapTransportTypes[transportType]}/fastest&Ajax=`, {
        method: 'GET'
      }).then(res => res.text()).then(data => {
        xml2js(data, (error, json) => {
          const rawPointsWithMess = json.osmRoute.wkt[0];
          const rawPoints = rawPointsWithMess.substring(14, rawPointsWithMess.length - 3).trim();
          const shapePoints = rawPoints ? rawPoints.split(', ').map((lonlat) => {
            const lonlatArray = lonlat.split(' ');
            return [ parseFloat(lonlatArray[1]), parseFloat(lonlatArray[0]) ];
          }) : [];
          const distance = rawPoints ? json.osmRoute.length[0] : null;
          const time = rawPoints ? json.osmRoute.time[0] : null;
          dispatch({ type: 'SET_ROUTE_PLANNER_RESULT', shapePoints, distance, time });
        });
      }).catch(() => {}).then(() => done());
    }

  }
});
