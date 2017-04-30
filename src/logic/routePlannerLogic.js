import { createLogic } from 'redux-logic';
import { mapRefocus } from 'fm3/actions/mapActions';
import { startProgress, stopProgress } from 'fm3/actions/mainActions';
import { routePlannerSetResult } from 'fm3/actions/routePlannerActions';
import { getMapLeafletElement } from 'fm3/leafletElementHolder';

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
      .then(({ route: { properties: { distance_in_km, time_in_minutes, itinerary }, geometry: { coordinates } } }) => {
        const routeLatLons = coordinates.map(lonlat => lonlat.reverse());
        const betterItinerary = itinerary.map(step => ({ lat: step.point[1], lon: step.point[0], desc: step.desc, km: step.distance_from_start_in_km }));
        dispatch(routePlannerSetResult(routeLatLons, betterItinerary, distance_in_km, time_in_minutes));
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

export const refocusMapOnSetStartOrFinishPoint = createLogic({
  type: [
    'ROUTE_PLANNER_SET_START',
    'ROUTE_PLANNER_SET_FINISH',
  ],
  process({ getState, action }, dispatch, done) {
    const { routePlanner: { start, finish } } = getState();
    let focusPoint;
    if (action.type === 'ROUTE_PLANNER_SET_START') {
      focusPoint = start;
    } else if (action.type === 'ROUTE_PLANNER_SET_FINISH') {
      focusPoint = finish;
    }

    if (!getMapLeafletElement().getBounds().contains(L.latLng(focusPoint.lat, focusPoint.lon))) {
      dispatch(mapRefocus({ lat: focusPoint.lat, lon: focusPoint.lon }));
    }

    done();
  },
});

export default [
  findRouteLogic,
  refocusMapOnSetStartOrFinishPoint,
];
