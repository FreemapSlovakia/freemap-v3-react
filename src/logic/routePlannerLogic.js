import axios from 'axios';
import { createLogic } from 'redux-logic';

import { getMapLeafletElement } from 'fm3/leafletElementHolder';

import { mapRefocus } from 'fm3/actions/mapActions';
import { startProgress, stopProgress } from 'fm3/actions/mainActions';
import { routePlannerSetResult } from 'fm3/actions/routePlannerActions';
import { toastsAddError, toastsAdd } from 'fm3/actions/toastsActions';

const updateRouteTypes = [
  'ROUTE_PLANNER_SET_START',
  'ROUTE_PLANNER_SET_FINISH',
  'ROUTE_PLANNER_ADD_MIDPOINT',
  'ROUTE_PLANNER_SET_MIDPOINT',
  'ROUTE_PLANNER_REMOVE_MIDPOINT',
  'ROUTE_PLANNER_SET_TRANSPORT_TYPE',
  'ROUTE_PLANNER_SET_PARAMS',
];

export const routePlannerFindRouteLogic = createLogic({
  type: updateRouteTypes,
  cancelType: ['SET_TOOL', ...updateRouteTypes],
  process({ getState, cancelled$ }, dispatch, done) {
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

    const pid = Math.random();
    dispatch(startProgress(pid));
    cancelled$.subscribe(() => {
      dispatch(stopProgress(pid));
    });

    axios.get(`//www.freemap.sk/api/0.3/route-planner/${allPoints}`, {
      params: {
        transport_type: transportType,
      },
      validateStatus: status => status === 200,
    })
      .then(({ data: { route: { properties: { distance_in_km, time_in_minutes, itinerary }, geometry: { coordinates } } } }) => {
        const routeLatLons = coordinates.map(lonlat => lonlat.reverse());
        if (routeLatLons.length === 0) {
          dispatch(toastsAdd({
            message: 'Cez zvolené body sa nepodarilo naplánovať trasu. Skúste zmeniť parametre alebo posunúť štart alebo cieľ.',
            style: 'warning',
            timeout: 5000,
          }));
        } else {
          const betterItinerary = itinerary.map(step => ({ lat: step.point[1], lon: step.point[0], desc: step.desc, km: step.distance_from_start_in_km }));
          dispatch(routePlannerSetResult(routeLatLons, betterItinerary, distance_in_km, time_in_minutes));
        }
      })
      .catch((e) => {
        dispatch(toastsAddError(`Nastala chyba pri hľadaní trasy: ${e.message}`));
      })
      .then(() => {
        dispatch(stopProgress(pid));
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
  routePlannerFindRouteLogic,
  refocusMapOnSetStartOrFinishPoint,
];
