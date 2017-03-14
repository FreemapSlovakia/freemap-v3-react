import { createLogic } from 'redux-logic';
import { parseString as xml2js } from 'xml2js';
import { distance } from 'fm3/geoutils';

const freemapTransportTypes = {
  'car': 'motorcar',
  'walk': 'hiking',
  'bicycle': 'bicycle'
};

export const findRouteLogic = createLogic({
  type: [
    'SET_ROUTE_PLANNER_START',
    'SET_ROUTE_PLANNER_FINISH',
    'ADD_ROUTE_PLANNER_MIDPOINT',
    'SET_ROUTE_PLANNER_MIDPOINT',
    'REMOVE_ROUTE_PLANNER_MIDPOINT',
    'SET_ROUTE_PLANNER_TRANSPORT_TYPE'
  ],
  process({ getState }, dispatch, done) {
    const { start, finish, midpoints, transportType } = getState().routePlanner;
    if (!start || !finish) {
      done();
      return;
    }

    const allPoints = [
      [ start.lat, start.lon ].join('%7C'),
      ...midpoints.map(mp => [ mp.lat, mp.lon ].join('%7C')),
      [ finish.lat, finish.lon ].join('%7C')
    ].join('/');

    fetch(`https://www.freemap.sk/api/0.1/r/${allPoints}/${freemapTransportTypes[transportType]}/fastest&Ajax=`)
      .then(res => res.text()).then(data => {
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
      })
      .catch(() => {})
      .then(() => done());
  }
});

const addMidpointToProperPositionLogic = createLogic({
  type: 'ADD_ROUTE_PLANNER_MIDPOINT',
  transform({ getState, action }, next) {
    const { start, finish, midpoints } = getState().routePlanner;
    if (midpoints.length > 0) {
      const newMidpoint = action.midpoint;
      const distances = [ start, ...midpoints, finish ].map(p => {
        return distance(p.lat, p.lon, newMidpoint.lat, newMidpoint.lon);
      });
      let minDistance = Infinity;
      let positionOfMinDistance;
      for (let i = 0; i < distances.length - 1; i++) {
        const d = distances[i] + distances[i+1];
        if (d < minDistance) {
          minDistance = d;
          positionOfMinDistance = i;
        }
      }
      action.position = positionOfMinDistance;
    }
    next(action);
  },
});

export default [
  findRouteLogic,
  addMidpointToProperPositionLogic
];
