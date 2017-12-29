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
    let deltaInMeters;
    if (totalDistanceInKm < 1.0) {
      deltaInMeters = 5;
    } else if (totalDistanceInKm < 5.0) {
      deltaInMeters = 25;
    } else if (totalDistanceInKm < 10.0) {
      deltaInMeters = 50;
    } else if (totalDistanceInKm < 50.0) {
      deltaInMeters = 250;
    } else {
      deltaInMeters = 500;
    }

    if (containsElevations(trackGeojson)) {
      resolveElevationProfilePointsLocally(trackGeojson, deltaInMeters, dispatch, done);
    } else {
      resolveElevationProfilePointsViaMapquest(trackGeojson, deltaInMeters, totalDistanceInKm, dispatch, cancelled$, storeDispatch, done);
    }
  },
});

function resolveElevationProfilePointsLocally(trackGeojson, deltaInMeters, dispatch, done) {
  const lonLatEleCoords = trackGeojson.geometry.coordinates;
  let distanceFromStartInMeters = 0.0;
  let currentXAxisPointCounter = 0;
  let prevLonlatEle = null;
  const elevationProfilePoints = [];
  lonLatEleCoords.forEach(([lon, lat, ele]) => {
    if (prevLonlatEle) {
      const [prevLon, prevLat] = prevLonlatEle;
      const distanceToPreviousPointInMeters = distance(lat, lon, prevLat, prevLon);
      distanceFromStartInMeters += distanceToPreviousPointInMeters;
      if (currentXAxisPointCounter * deltaInMeters <= distanceFromStartInMeters) {
        elevationProfilePoints.push({
          lat, lon, ele, distanceFromStartInMeters,
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
  const deltaInKm = deltaInMeters / 1000.0;
  const elevationProfilePoints = [];
  for (let distanceFromStartInKm = 0.0; distanceFromStartInKm <= totalDistanceInKm; distanceFromStartInKm += deltaInKm) {
    const [lon, lat] = turfAlong(trackGeojson, distanceFromStartInKm).geometry.coordinates;
    elevationProfilePoints.push({ lat, lon, distanceFromStartInMeters: distanceFromStartInKm * 1000.0 });
  }

  const latlonsForMapQuest = elevationProfilePoints.map(({ lat, lon }) => `${lat},${lon}`).join(',');
  const pid = Math.random();
  dispatch(startProgress(pid));
  const source = axios.CancelToken.source();
  cancelled$.subscribe(() => {
    source.cancel();
  });
  axios.get('//open.mapquestapi.com/elevation/v1/profile', {
    params: {
      key: process.env.MAPQUEST_API_KEY,
      latLngCollection: latlonsForMapQuest,
    },
    validateStatus: status => status === 200,
    cancelToken: source.token,
  })
    .then(({ data: { elevationProfile } }) => {
      elevationProfile.forEach(({ height }, i) => {
        elevationProfilePoints[i].ele = height;
      });
      dispatch(elevationChartSetElevationProfile(elevationProfilePoints));
    }).catch((e) => {
      dispatch(toastsAddError(`Nastala chyba pri získavani výškoveho profilu: ${e.message}`));
    })
    .then(() => {
      storeDispatch(stopProgress(pid));
      done();
    });
}
