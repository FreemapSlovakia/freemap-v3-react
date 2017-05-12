import { createLogic } from 'redux-logic';
import turfLineDistance from '@turf/line-distance';
import toGeoJSON from '@mapbox/togeojson';

const DOMParser = require('xmldom').DOMParser; // TODO browsers have native DOM implementation - use that

export default createLogic({
  type: 'TRACK_VIEWER_SET_TRACK_DATA',
  transform({ getState, action }, next) {
    // TODO add try/catch and show toast if parsing fails
    const gpxAsXml = new DOMParser().parseFromString(action.payload.trackGpx);
    const trackGeojson = toGeoJSON.gpx(gpxAsXml);

    const startPoints = [];
    const finishPoints = [];
    if (trackGeojson) {
      trackGeojson.features.forEach((feature) => {
        if (feature.geometry.type === 'LineString') {
          const lengthInKm = turfLineDistance(feature);
          const coords = feature.geometry.coordinates;
          const startLonlat = coords[0];
          let startTime;
          let finishTime;
          const times = feature.properties.coordTimes;
          if (times) {
            startTime = times[0];
            finishTime = times[times.length - 1];
          }
          const start = { lat: startLonlat[1], lon: startLonlat[0], startTime };
          startPoints.push(start);

          const finishLonLat = coords[coords.length - 1];
          const finish = { lat: finishLonLat[1], lon: finishLonLat[0], lengthInKm, finishTime };
          finishPoints.push(finish);
        }
      });
    }
    const enahancedAction = Object.assign({}, action);
    enahancedAction.payload.trackGeojson = trackGeojson;
    enahancedAction.payload.startPoints = startPoints;
    enahancedAction.payload.finishPoints = finishPoints;
    next(enahancedAction);
  },
});
