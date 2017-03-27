import { createLogic } from 'redux-logic';
import { distance } from 'fm3/geoutils';
import { mapRefocus } from 'fm3/actions/mapActions';
import { startProgress, stopProgress } from 'fm3/actions/mainActions';
import { routePlannerSetResult } from 'fm3/actions/routePlannerActions';
import { getLeafletElement } from 'fm3/leafletElementHolder';

export const findRouteLogic = createLogic({
  type: [
    'ROUTE_PLANNER_SET_START',
    'ROUTE_PLANNER_SET_FINISH',
    'ROUTE_PLANNER_ADD_MIDPOINT',
    'ROUTE_PLANNER_SET_MIDPOINT',
    'ROUTE_PLANNER_REMOVE_MIDPOINT',
    'ROUTE_PLANNER_SET_TRANSPORT_TYPE',
  ],
  process({ getState }, dispatch, done) {
    const { start, finish, midpoints, transportType } = getState().routePlanner;
    if (!start || !finish) {
      done();
      return;
    }

    const allPoints = [
      [start.lat, start.lon].join(','),
      ...midpoints.map(mp => [mp.lat, mp.lon].join(',')),
      [finish.lat, finish.lon].join(','),
    ].join(',');

    dispatch(startProgress());
    const url = `//www.freemap.sk/api/0.3/route-planner/${allPoints}?transport_type=${transportType}`;
    fetch(url)
      .then(res => res.json())
      .then(({ route: { properties: { distance_in_km, time_in_minutes }, geometry: { coordinates } } }) => {
        const routeLatLons = coordinates.map(lonlat => lonlat.reverse());
        dispatch(routePlannerSetResult(routeLatLons, distance_in_km, time_in_minutes));
      })
      .catch(() => {
        // TODO display toast with error
      })
      .then(() => {
        dispatch(stopProgress());
        done();
      });
  },
});

export const addMidpointToProperPositionLogic = createLogic({
  type: 'ROUTE_PLANNER_ADD_MIDPOINT',
  transform({ getState, action }, next) {
    const { start, finish, midpoints } = getState().routePlanner;
    if (midpoints.length > 0) {
      const newMidpoint = action.payload.midpoint;
      const distances = [start, ...midpoints, finish].map(p => distance(p.lat, p.lon, newMidpoint.lat, newMidpoint.lon));
      let minDistance = Infinity;
      let positionOfMinDistance;
      for (let i = 0; i < distances.length - 1; i += 1) {
        const d = distances[i] + distances[i + 1];
        if (d < minDistance) {
          minDistance = d;
          positionOfMinDistance = i;
        }
      }
      next({ ...action, payload: { ...action.payload, position: positionOfMinDistance } });
    } else {
      next(action);
    }
  },
});

export const refocusMapOnSetStartOrFinishPoint = createLogic({
  type: [
    'ROUTE_PLANNER_SET_START',
    'ROUTE_PLANNER_SET_FINISH',
  ],
  process({ getState, action }, dispatch) {
    const { routePlanner: { start, finish } } = getState();
    let focusPoint;
    if (action.type === 'ROUTE_PLANNER_SET_START') {
      focusPoint = start;
    } else if (action.type === 'ROUTE_PLANNER_SET_FINISH') {
      focusPoint = finish;
    }

    if (!getLeafletElement().getBounds().contains(L.latLng(focusPoint.lat, focusPoint.lon))) {
      dispatch(mapRefocus({ lat: focusPoint.lat, lon: focusPoint.lon }));
    }
  },
});

export default [
  findRouteLogic,
  addMidpointToProperPositionLogic,
  refocusMapOnSetStartOrFinishPoint,
];
