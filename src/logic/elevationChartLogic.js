import axios from 'axios';
import { createLogic } from 'redux-logic';
import turfAlong from '@turf/along';
import turfLength from '@turf/length';
import { getCoords, getCoord } from '@turf/invariant';

import * as at from 'fm3/actionTypes';
import { distance, containsElevations } from 'fm3/geoutils';

import { elevationChartSetElevationProfile } from 'fm3/actions/elevationChartActions';
import { startProgress, stopProgress } from 'fm3/actions/mainActions';
import { toastsAddError } from 'fm3/actions/toastsActions';

export default createLogic({
  type: at.ELEVATION_CHART_SET_TRACK_GEOJSON,
  cancelType: [at.ELEVATION_CHART_SET_TRACK_GEOJSON, at.SET_TOOL, at.ELEVATION_CHART_CLOSE],
  process({ getState, cancelled$, storeDispatch }, dispatch, done) {
    const { trackGeojson } = getState().elevationChart;

    if (containsElevations(trackGeojson)) {
      resolveElevationProfilePointsLocally(trackGeojson, dispatch, done);
    } else {
      resolveElevationProfilePointsViaApi(trackGeojson, dispatch, cancelled$, storeDispatch, done);
    }
  },
});

function resolveElevationProfilePointsLocally(trackGeojson, dispatch, done) {
  let dist = 0;
  let prevLonlatEle = null;
  const elevationProfilePoints = [];
  getCoords(trackGeojson).forEach(([lon, lat, ele]) => {
    if (prevLonlatEle) {
      const [prevLon, prevLat] = prevLonlatEle;
      dist += distance(lat, lon, prevLat, prevLon);
      elevationProfilePoints.push({
        lat, lon, ele, distance: dist,
      });
    }
    prevLonlatEle = [lon, lat, ele];
  });

  dispatch(elevationChartSetElevationProfile(elevationProfilePoints));
  done();
}

function resolveElevationProfilePointsViaApi(trackGeojson, dispatch, cancelled$, storeDispatch, done) {
  const totalDistanceInKm = turfLength(trackGeojson);
  const delta = Math.min(0.1, totalDistanceInKm / (window.innerWidth / 2));
  const elevationProfilePoints = [];
  for (let dist = 0; dist <= totalDistanceInKm; dist += delta) {
    const [lon, lat] = getCoord(turfAlong(trackGeojson, dist));
    elevationProfilePoints.push({ lat, lon, distance: dist * 1000 });
  }

  const pid = Math.random();
  dispatch(startProgress(pid));
  const source = axios.CancelToken.source();
  cancelled$.subscribe(() => {
    source.cancel();
  });
  axios.post(
    `${process.env.API_URL}/geotools/elevation`,
    elevationProfilePoints.map(({ lat, lon }) => ([lat, lon])),
    {
      validateStatus: status => status === 200,
      cancelToken: source.token,
    },
  )
    .then(({ data }) => {
      let climbUp = 0;
      let climbDown = 0;
      let prevEle;
      data.forEach((ele, i) => {
        if (i) {
          const d = ele - prevEle;
          if (d > 0) {
            climbUp += d;
          } else {
            climbDown -= d;
          }
        }

        // TODO following are computed data, should not go to store
        Object.assign(elevationProfilePoints[i], { ele, climbUp, climbDown });
        prevEle = ele;
      });
      dispatch(elevationChartSetElevationProfile(elevationProfilePoints));
    }).catch((err) => {
      dispatch(toastsAddError('elevationChart.fetchError', err));
    })
    .then(() => {
      storeDispatch(stopProgress(pid));
      done();
    });
}
