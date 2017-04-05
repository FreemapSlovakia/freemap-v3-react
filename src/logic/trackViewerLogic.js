import { createLogic } from 'redux-logic';
import turfLineDistance from '@turf/line-distance';

export default createLogic({
  type: 'TRACK_VIEWER_SET_TRACK_GEOJSON',
  transform({ getState, action }, next) {
    const trackGeojson = action.payload.trackGeojson;
    const startPoints = [];
    const finishPoints = [];
    if (trackGeojson) {
      trackGeojson.features.forEach((feature) => {
        if (feature.geometry.type === 'LineString') {
          const lengthInKm = turfLineDistance(feature);
          const coords = feature.geometry.coordinates;
          const startLonlat = coords[0];
          const finishLonLat = coords[coords.length - 1];
          startPoints.push({ lat: startLonlat[1], lon: startLonlat[0] });
          finishPoints.push({ lat: finishLonLat[1], lon: finishLonLat[0], lengthInKm });
        }
      });
    }
    const enahancedAction = Object.assign({}, action);
    enahancedAction.payload.startPoints = startPoints;
    enahancedAction.payload.finishPoints = finishPoints;
    next(enahancedAction);
  },
});
