import { createLogic } from 'redux-logic';
import turfLineDistance from '@turf/line-distance';
import toGeoJSON from '@mapbox/togeojson';
import * as at from 'fm3/actionTypes';

export default createLogic({
  type: at.TRACK_VIEWER_SET_TRACK_DATA,
  transform({ action }, next) {
    if (!action.payload.trackGpx) {
      next(action);
      return;
    }

    // TODO add error handling for failed string-to-gpx and gpx-to-geojson parsing
    const gpxAsXml = new DOMParser().parseFromString(action.payload.trackGpx, 'text/xml');
    const trackGeojson = toGeoJSON.gpx(gpxAsXml);

    const startPoints = [];
    const finishPoints = [];
    trackGeojson.features.forEach((feature) => {
      if (feature.geometry.type === 'LineString') {
        const lengthInKm = turfLineDistance(feature);
        const coords = feature.geometry.coordinates;
        const startLonlat = coords[0];
        let startTime;
        let finishTime;
        const times = feature.properties.coordTimes;
        if (times) {
          [startTime] = times;
          finishTime = times[times.length - 1];
        }
        startPoints.push({ lat: startLonlat[1], lon: startLonlat[0], startTime });

        const finishLonLat = coords[coords.length - 1];
        finishPoints.push({
          lat: finishLonLat[1], lon: finishLonLat[0], lengthInKm, finishTime,
        });
      }
    });
    next({
      ...action,
      payload: {
        ...action.payload, trackGeojson, startPoints, finishPoints,
      },
    });
  },
});
