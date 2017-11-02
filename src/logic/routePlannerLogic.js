import React from 'react';
import axios from 'axios';
import { createLogic } from 'redux-logic';

import { getMapLeafletElement } from 'fm3/leafletElementHolder';

import { mapRefocus } from 'fm3/actions/mapActions';
import { startProgress, stopProgress } from 'fm3/actions/mainActions';
import { routePlannerSetResult, routePlannerSetTransportType, routePlannerPreventHint } from 'fm3/actions/routePlannerActions';
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

const types = {
  turn: 'odbočte',
  'new name': 'choďte',
  depart: 'začnite',
  arrive: 'ukončte',
  merge: 'pokračujte',
  // 'ramp':
  'on ramp': 'choďte na príjazdovú cestu',
  'off ramp': 'opusťte príjazdovú cestu',
  fork: 'zvoľte cestu',
  'end of road': 'pokračujte',
  // 'use lane':
  continue: 'pokračujte',
  roundabout: 'vojdite na kruhový objazd',
  rotary: 'vojdite na okružnú cestu',
  'roundabout turn': 'na kruhovom objazde odbočte',
  // 'notification':
  'exit rotary': 'opusťte okružnú cestu', // undocumented
  'exit roundabout': 'opusťte kruhový objazd', // undocumented
};

const modifiers = {
  uturn: 'otočte sa',
  'sharp right': 'prudko doprava',
  'slight right': 'mierne doprava',
  right: 'doprava',
  'sharp left': 'prudko doľava',
  'slight left': 'mierne doľava',
  left: 'doľava',
  straight: 'priamo',
};

export const routePlannerFindRouteLogic = createLogic({
  type: updateRouteTypes,
  cancelType: ['SET_TOOL', ...updateRouteTypes],
  process({ getState, cancelled$, storeDispatch, action }, dispatch, done) {
    const {
      start, finish, midpoints, transportType,
    } = getState().routePlanner;
    if (!start || !finish) {
      done();
      return;
    }

    const allPoints = [
      [start.lon, start.lat].join(','),
      ...midpoints.map(mp => [mp.lon, mp.lat].join(',')),
      [finish.lon, finish.lat].join(','),
    ].join(';');

    const pid = Math.random();
    dispatch(startProgress(pid));
    const source = axios.CancelToken.source();
    cancelled$.subscribe(() => {
      source.cancel();
    });

    const params = {
      overview: 'full',
      alternatives: false,
      steps: true,
      geometries: 'geojson',
    };

    if (transportType === 'car-free') {
      params.exclude = 'motorway';
    }

    axios.get(`https://routing.epsilon.sk/route/v1/${transportType.replace('-free', '')}/${allPoints}`, {
      params,
      validateStatus: status => status === 200,
      cancelToken: source.token,
    })
      .then(({ data: { code, routes } }) => {
        if (code === 'Ok') {
          const [{ legs, distance: totalDistance, duration: totalDuration, geometry: { coordinates } }] = routes;
          const routeLatLons = coordinates.map(lonlat => lonlat.reverse());
          const iti = [].concat(...legs.map(leg => leg.steps.map(({ name, distance, duration, maneuver: { type, modifier, location: [lon, lat] } }) => ({
            lat,
            lon,
            km: distance / 1000,
            duration,
            desc: `${types[type] || type}${modifier ? ` ${modifiers[modifier] || modifier}` : ''}${name ? ` na ${name}` : ''}`,
          }))));

          const showHint = true
            && !getState().routePlanner.shapePoints
            && !localStorage.getItem('routePlannerPreventHint')
            && !midpoints.lenght
            && ['ROUTE_PLANNER_SET_START', 'ROUTE_PLANNER_SET_FINISH'].includes(action.type);

          if (showHint) {
            dispatch(toastsAdd({
              collapseKey: 'routePlanner.showHint',
              message: <span>Pre pridanie medzizastávky potiahnite modrú guličku zo stredu naplánovanej trasy na zvolené miesto.</span>,
              style: 'info',
              actions: [
                { name: 'OK' },
                { name: 'Už viac nezobrazovať', action: routePlannerPreventHint() },
              ],
            }));
          }

          dispatch(routePlannerSetResult(routeLatLons, iti, totalDistance / 1000, totalDuration / 60));
        } else {
          dispatch(toastsAdd({
            message: 'Cez zvolené body sa nepodarilo naplánovať trasu. Skúste zmeniť parametre alebo posunúť štart alebo cieľ.',
            style: 'warning',
            timeout: 5000,
          }));
        }
      })
      .catch((e) => {
        dispatch(toastsAddError(`Nastala chyba pri hľadaní trasy: ${e.message}`));
      })
      .then(() => {
        storeDispatch(stopProgress(pid));
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

export const setupTransportTypeLogic = createLogic({
  type: 'SET_TOOL',
  process({ getState }, dispatch, done) {
    const { main: { tool }, routePlanner: { transportType, start, finish } } = getState();
    if (tool === 'route-planner' && (!transportType) || !start && !finish) {
      const { mapType } = getState().map;
      dispatch(routePlannerSetTransportType(mapType === 'T' ? 'foot' : ['C', 'K', 'M'].includes(mapType) ? 'bike' : 'car'));
    }

    done();
  },
});

export const routePlannerPreventHintLogic = createLogic({
  type: 'ROUTE_PLANNER_PREVENT_HINT',
  process(_, dispatch, done) {
    localStorage.setItem('routePlannerPreventHint', '1');
    done();
  },
});

export default [
  routePlannerFindRouteLogic,
  refocusMapOnSetStartOrFinishPoint,
  setupTransportTypeLogic,
  routePlannerPreventHintLogic,
];
