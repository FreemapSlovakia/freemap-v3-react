import { createLogic } from 'redux-logic';
import turfLineDistance from '@turf/line-distance';
import toGeoJSON from '@mapbox/togeojson';
import { startProgress, stopProgress } from 'fm3/actions/mainActions';
import { trackViewerSetData, trackViewerSetTrackUID } from 'fm3/actions/trackViewerActions';
import { toastsAddError } from 'fm3/actions/toastsActions';

export const trackViewerSetTrackDataLogic = createLogic({
  type: 'TRACK_VIEWER_SET_TRACK_DATA',
  transform({ action }, next) {
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
          startTime = times[0];
          finishTime = times[times.length - 1];
        }
        startPoints.push({ lat: startLonlat[1], lon: startLonlat[0], startTime });

        const finishLonLat = coords[coords.length - 1];
        finishPoints.push({ lat: finishLonLat[1], lon: finishLonLat[0], lengthInKm, finishTime });
      }
    });
    next({ ...action, payload: { ...action.payload, trackGeojson, startPoints, finishPoints } });
  },
});

export const trackViewerDownloadTrackLogic = createLogic({
  type: 'TRACK_VIEWER_DOWNLOAD_TRACK',
  process({ getState }, dispatch, done) {
    const trackUID = getState().trackViewer.trackUID;
    fetch(`${process.env.API_URL}/tracklogs/${trackUID}`)
      .then((res) => {
        if (res.status !== 200) {
          throw new Error(`Server vrátil neočakávaný status: ${res.status}`);
        } else {
          return res.json();
        }
      })
      .then((payload) => {
        if (payload.error) {
          dispatch(toastsAddError(`Nastala chyba pri získavaní GPX záznamu: ${payload.error}`));
        } else {
          const trackGpx = atob(payload.data);
          dispatch(trackViewerSetData(trackGpx));
        }
      })
      .catch((e) => {
        dispatch(toastsAddError(`Nastala chyba pri získavaní GPX záznamu: ${e.message}`));
      })
      .then(() => {
        done();
      });
  },
});

export const trackViewerUploadTrackLogic = createLogic({
  type: 'TRACK_VIEWER_UPLOAD_TRACK',
  process({ getState, cancelled$ }, dispatch, done) {
    const trackGpx = getState().trackViewer.trackGpx;
    if (trackGpx.length > (process.env.MAX_GPX_TRACK_SIZE_IN_MB * 1000000)) {
      dispatch(toastsAddError(`Veľkosť nahraného súboru prevyšuje ${process.env.MAX_GPX_TRACK_SIZE_IN_MB} MB. Zdieľanie podporujeme len pre menšie súbory.`));
    } else {
      const pid = Math.random();
      dispatch(startProgress(pid));
      cancelled$.subscribe(() => {
        dispatch(stopProgress(pid));
      });

      fetch(`${process.env.API_URL}/tracklogs`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: btoa(unescape(encodeURIComponent(trackGpx))),
          mediaType: 'application/gpx+xml',
        }),
      })
        .then((res) => {
          if (res.status !== 201) {
            throw new Error(`Server vrátil neočakávaný status: ${res.status}`);
          } else {
            return res.json();
          }
        })
        .then((res) => {
          dispatch(trackViewerSetTrackUID(res.uid));
        })
        .catch((e) => {
          dispatch(toastsAddError(`Nepodarilo sa nahrať súbor: ${e.message}`));
        })
        .then(() => {
          dispatch(stopProgress(pid));
          done();
        });
    }
  },
});

export default [
  trackViewerSetTrackDataLogic,
  trackViewerDownloadTrackLogic,
  trackViewerUploadTrackLogic,
];
