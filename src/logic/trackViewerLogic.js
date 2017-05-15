import { createLogic } from 'redux-logic';
import turfLineDistance from '@turf/line-distance';
import toGeoJSON from '@mapbox/togeojson';
import { trackViewerSetData } from 'fm3/actions/trackViewerActions';
import { toastsAdd } from 'fm3/actions/toastsActions';
import { getNodejsBackendURL } from 'fm3/backendDefinitions';
import 'whatwg-fetch';

const DOMParser = require('xmldom').DOMParser; // TODO browsers have native DOM implementation - use that

export const trackViewerSetTrackDataLogic = createLogic({
  type: 'TRACK_VIEWER_SET_TRACK_DATA',
  transform({ getState, action }, next) {
    // TODO add error handling for failed string-to-gpx and gpx-to-geojson parsing
    const gpxAsXml = new DOMParser().parseFromString(action.payload.trackGpx);
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
    const enahancedAction = Object.assign({}, action);
    enahancedAction.payload.trackGeojson = trackGeojson;
    enahancedAction.payload.startPoints = startPoints;
    enahancedAction.payload.finishPoints = finishPoints;
    next(enahancedAction);
  },
});

export const trackViewerDownloadTrackLogic = createLogic({
  type: 'TRACK_VIEWER_DOWNLOAD_TRACK',
  process({ getState }, dispatch, done) {
    const trackUID = getState().trackViewer.trackUID;
    fetch(`${getNodejsBackendURL()}/tracklogs/${trackUID}`)
      .then(res => res.json()).then((payload) => {
        if (payload.error) {
          dispatch(createErrorToast(payload.error));
        } else {
          const trackGpx = atob(payload.data);
          dispatch(trackViewerSetData(trackGpx));
        }
      })
      .catch((e) => {
        dispatch(createErrorToast(e));
      })
      .then(() => {
        done();
      });
  },
});

function createErrorToast(errorText) {
  return toastsAdd({
    message: `Nastala chyba pri získavaní GPX záznamu: ${errorText}`,
    style: 'danger',
    timeout: 3000,
    actions: [{ name: 'OK' }],
  });
}

export default [
  trackViewerSetTrackDataLogic,
  trackViewerDownloadTrackLogic,
];

