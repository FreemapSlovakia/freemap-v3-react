import axios from 'axios';
import { createLogic } from 'redux-logic';
import turfAlong from '@turf/along';
import turfLineDistance from '@turf/line-distance';

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
    const totalDistanceInKm = turfLineDistance(trackGeojson);
    const deltaInMeters = totalDistanceInKm;
    // if (totalDistanceInKm < 1.0) {
    //   deltaInMeters = 5;
    // } else if (totalDistanceInKm < 5.0) {
    //   deltaInMeters = 25;
    // } else if (totalDistanceInKm < 10.0) {
    //   deltaInMeters = 50;
    // } else if (totalDistanceInKm < 50.0) {
    //   deltaInMeters = 250;
    // } else {
    //   deltaInMeters = 500;
    // }

    if (containsElevations(trackGeojson)) {
      resolveElevationProfilePointsLocally(trackGeojson, deltaInMeters, dispatch, done);
    } else {
      resolveElevationProfilePointsViaMapquest(trackGeojson, deltaInMeters, totalDistanceInKm, dispatch, cancelled$, storeDispatch, done);
    }
  },
});

function resolveElevationProfilePointsLocally(trackGeojson, deltaInMeters, dispatch, done) {
  const lonLatEleCoords = trackGeojson.geometry.coordinates;
  let distance = 0.0;
  let currentXAxisPointCounter = 0;
  let prevLonlatEle = null;
  const elevationProfilePoints = [];
  lonLatEleCoords.forEach(([lon, lat, ele]) => {
    if (prevLonlatEle) {
      const [prevLon, prevLat] = prevLonlatEle;
      const distanceToPreviousPointInMeters = distance(lat, lon, prevLat, prevLon);
      distance += distanceToPreviousPointInMeters;
      if (currentXAxisPointCounter * deltaInMeters <= distance) {
        elevationProfilePoints.push({
          lat, lon, ele, distance,
        });
        currentXAxisPointCounter += 1;
      }
    }
    prevLonlatEle = [lon, lat, ele];
  });

  dispatch(elevationChartSetElevationProfile(elevationProfilePoints));
  done();
}

function resolveElevationProfilePointsViaMapquest(trackGeojson, deltaInMeters, totalDistanceInKm, dispatch, cancelled$, storeDispatch, done) {
  const deltaInKm = deltaInMeters / 1000;
  const elevationProfilePoints = [];
  for (let dist = 0.0; dist <= totalDistanceInKm; dist += deltaInKm) {
    const [lon, lat] = turfAlong(trackGeojson, dist).geometry.coordinates;
    elevationProfilePoints.push({ lat, lon, distance: dist * 1000 });
  }

  const pid = Math.random();
  dispatch(startProgress(pid));
  const source = axios.CancelToken.source();
  cancelled$.subscribe(() => {
    source.cancel();
  });
  axios.get(`${process.env.API_URL}/geotools/elevation`, {
    params: {
      coordinates: elevationProfilePoints.map(({ lat, lon }) => `${lat},${lon}`).join(','),
    },
    validateStatus: status => status === 200,
    cancelToken: source.token,
  })
    .then(({ data }) => {
      data.forEach((height, i) => {
        elevationProfilePoints[i].ele = height;
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
