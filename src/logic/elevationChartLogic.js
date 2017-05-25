import { createLogic } from 'redux-logic';
import turfLineDistance from '@turf/line-distance';
import { distance } from 'fm3/geoutils';

import { elevationChartSetElevationProfile } from 'fm3/actions/elevationChartActions';

export default createLogic({
  type: 'ELEVATION_CHART_SET_TRACK_GEOJSON',
  process({ getState }, dispatch) {
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

    const lonLatEleCoords = trackGeojson.features[0].geometry.coordinates;
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
  },
});
