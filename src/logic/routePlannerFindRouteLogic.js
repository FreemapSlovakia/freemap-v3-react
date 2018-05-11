import axios from 'axios';
import { createLogic } from 'redux-logic';

import { startProgress, stopProgress } from 'fm3/actions/mainActions';
import { routePlannerSetResult, routePlannerPreventHint } from 'fm3/actions/routePlannerActions';
import { toastsAddError, toastsAdd } from 'fm3/actions/toastsActions';
import * as at from 'fm3/actionTypes';

const updateRouteTypes = [
  at.ROUTE_PLANNER_SET_START,
  at.ROUTE_PLANNER_SET_FINISH,
  at.ROUTE_PLANNER_SWAP_ENDS,
  at.ROUTE_PLANNER_ADD_MIDPOINT,
  at.ROUTE_PLANNER_SET_MIDPOINT,
  at.ROUTE_PLANNER_REMOVE_MIDPOINT,
  at.ROUTE_PLANNER_SET_TRANSPORT_TYPE,
  at.ROUTE_PLANNER_SET_PARAMS,
];

export default createLogic({
  type: updateRouteTypes,
  cancelType: [...updateRouteTypes],
  process({ getState, cancelled$, storeDispatch, action }, dispatch, done) {
    const { start, finish, midpoints, transportType } = getState().routePlanner;
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
      alternatives: true,
      steps: true,
      geometries: 'geojson',
      // continue_straight: true,
    };

    if (transportType === 'car-free') {
      params.exclude = 'toll';
    }

    if (transportType === 'foot-stroller') {
      params.exclude = 'stroller';
    }

    axios.get(`https://routing.epsilon.sk/route/v1/${transportType.replace(/-.*/, '')}/${allPoints}`, {
      params,
      validateStatus: status => [200, 400].includes(status),
      cancelToken: source.token,
    })
      .then(({ data: { code, routes } }) => {
        if (code === 'Ok') {
          const showHint = true
            && !getState().routePlanner.shapePoints
            && !localStorage.getItem('routePlannerPreventHint')
            && !midpoints.lenght
            && ['ROUTE_PLANNER_SET_START', 'ROUTE_PLANNER_SET_FINISH'].includes(action.type);

          if (showHint) {
            dispatch(toastsAdd({
              collapseKey: 'routePlanner.showMidpointHint',
              messageKey: 'routePlanner.showMidpointHint',
              style: 'info',
              actions: [
                { nameKey: 'general.ok' },
                { nameKey: 'general.preventShowingAgain', action: routePlannerPreventHint() },
              ],
            }));
          }

          const alts = routes.map((route) => {
            const { legs, distance: totalDistance, duration: totalDuration, extra: totalExtra } = route;
            const itinerary = [].concat(...legs.map((leg, legIndex) => leg.steps.map(({
              name, distance, duration, mode, geometry, extra, maneuver: { type, modifier, location: [lon, lat] },
            }) => ({
              maneuver: {
                location: {
                  lat,
                  lon,
                },
                type,
                modifier,
              },
              distance,
              duration,
              name,
              type,
              modifier,
              mode,
              shapePoints: geometry.coordinates.map(lonlat => lonlat.reverse()),
              legIndex,
              extra,
            }))));

            return {
              itinerary,
              distance: totalDistance / 1000,
              duration: totalDuration / 60,
              extra: totalExtra,
            };
          });

          const alternatives = transportType === 'imhd' ? alts.map(alt => addMissingSegments(alt)) : alts;

          dispatch(routePlannerSetResult({ timestamp: Date.now(), transportType, alternatives }));
        } else {
          dispatch(routePlannerSetResult({ timestamp: Date.now(), transportType, alternatives: [] }));
          dispatch(toastsAdd({
            collapseKey: 'routePlanner.routeNotFound',
            messageKey: 'routePlanner.routeNotFound',
            style: 'warning',
            timeout: 5000,
          }));
        }
      })
      .catch((err) => {
        dispatch(routePlannerSetResult({ timestamp: Date.now(), transportType, alternatives: [] }));
        dispatch(toastsAddError('routePlanner.fetchingError', err));
      })
      .then(() => {
        storeDispatch(stopProgress(pid));
        done();
      });
  },
});

function addMissingSegments(alt) {
  const routeSlices = [];
  for (let i = 0; i < alt.itinerary.length; i += 1) {
    const slice = alt.itinerary[i];
    const prevSlice = alt.itinerary[i - 1];
    const nextSlice = alt.itinerary[i + 1];

    const prevSliceLastShapePoint = prevSlice ? prevSlice.shapePoints[prevSlice.shapePoints.length - 1] : null;
    const firstShapePoint = slice.shapePoints[0];

    const lastShapePoint = slice.shapePoints[slice.shapePoints.length - 1];
    const nextSliceFirstShapePoint = nextSlice ? nextSlice.shapePoints[0] : null;

    const shapePoints = [...slice.shapePoints];

    if (slice.mode === 'foot') {
      if (prevSliceLastShapePoint
        && (Math.abs(prevSliceLastShapePoint[0] - firstShapePoint[0]) > 0.0000001 || Math.abs(prevSliceLastShapePoint[1] - firstShapePoint[1]) > 0.0000001)
      ) {
        shapePoints.unshift(prevSliceLastShapePoint);
      }

      if (nextSliceFirstShapePoint
        && (Math.abs(nextSliceFirstShapePoint[0] - lastShapePoint[0]) > 0.0000001 || Math.abs(nextSliceFirstShapePoint[1] - lastShapePoint[1]) > 0.0000001)
      ) {
        shapePoints.push(nextSliceFirstShapePoint);
      }
    }

    routeSlices.push({
      ...slice,
      shapePoints,
    });
  }

  return { ...alt, itinerary: routeSlices };
}
