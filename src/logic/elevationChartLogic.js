import { createLogic } from 'redux-logic';
import turfAlong from '@turf/along';
import turfLineDistance from '@turf/line-distance';
import { distance, containsElevations } from 'fm3/geoutils';

import { elevationChartSetElevationProfile } from 'fm3/actions/elevationChartActions';
import { startProgress, stopProgress } from 'fm3/actions/mainActions';
import { MAPQUEST_API_KEY } from 'fm3/backendDefinitions';

export default createLogic({
  type: 'ELEVATION_CHART_SET_TRACK_GEOJSON',
  cancelType: ['ELEVATION_CHART_SET_TRACK_GEOJSON', 'SET_TOOL'],
  process({ getState }, dispatch, done) {
    const trackGeojson = getState().elevationChart.trackGeojson;
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
      resolveElevationProfilePointsViaMapquest(trackGeojson, deltaInMeters, totalDistanceInKm, dispatch, done);
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
        elevationProfilePoints.push({ lat, lon, ele, distanceFromStartInMeters });
        currentXAxisPointCounter += 1;
      }
    }
    prevLonlatEle = [lon, lat, ele];
  });

  dispatch(elevationChartSetElevationProfile(elevationProfilePoints));
  done();
}

function resolveElevationProfilePointsViaMapquest(trackGeojson, deltaInMeters, totalDistanceInKm, dispatch, done) {
  const deltaInKm = deltaInMeters / 1000.0;
  const elevationProfilePoints = [];
  for (let distanceFromStartInKm = 0.0; distanceFromStartInKm <= totalDistanceInKm; distanceFromStartInKm += deltaInKm) {
    const [lon, lat] = turfAlong(trackGeojson, distanceFromStartInKm).geometry.coordinates;
    elevationProfilePoints.push({ lat, lon, distanceFromStartInMeters: distanceFromStartInKm * 1000.0 });
  }

  const latlonsForMapQuest = elevationProfilePoints.map(({ lat, lon }) => `${lat},${lon}`).join(',');
  dispatch(startProgress());
  const url = `//open.mapquestapi.com/elevation/v1/profile?key=${MAPQUEST_API_KEY}&latLngCollection=${latlonsForMapQuest}`;
  fetch(url)
    .then(res => res.json())
    .then(({ elevationProfile }) => {
      elevationProfile.forEach(({ height }, i) => {
        elevationProfilePoints[i].ele = height;
      });
      dispatch(elevationChartSetElevationProfile(elevationProfilePoints));
    }).catch(() => {
        // TODO display toast with error
    })
    .then(() => {
      dispatch(stopProgress());
      done();
    });
}
