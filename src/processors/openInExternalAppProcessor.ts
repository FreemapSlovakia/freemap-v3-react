import bbox from '@turf/bbox';
import buffer from '@turf/buffer';
import { point } from '@turf/helpers';
import { openInExternalApp } from '../actions/mainActions.js';
import { toastsAdd } from '../actions/toastsActions.js';
import { copyToClipboard } from '../clipboardUtils.js';
import {
  getF4mapUrl,
  getGoogleUrl,
  getHikingSkUrl,
  getIdUrl,
  getMapillaryUrl,
  getMapyCzUrl,
  getOmaUrl,
  getOpenStreetCamUrl,
  getOsmUrl,
  getPeakfinderUrl,
  getWazeUrl,
  getZbgisUrl,
} from '../externalUrlUtils.js';
import { mapPromise } from '../leafletElementHolder.js';
import { Processor } from '../middlewares/processorMiddleware.js';

export const openInExternalAppProcessor: Processor<typeof openInExternalApp> = {
  actionCreator: openInExternalApp,
  handle: async ({ action, getState, dispatch }) => {
    const {
      where,
      lat: lat0,
      lon: lon0,
      zoom: zoom0,
      mapType: mapType0,
      includePoint,
      pointTitle,
      pointDescription,
      url,
    } = action.payload;

    const lat = lat0 ?? getState().map.lat;

    const lon = lon0 ?? getState().map.lon;

    const zoom = zoom0 ?? getState().map.zoom;

    const mapType = mapType0 ?? getState().map.mapType;

    window._paq.push(['trackEvent', 'Main', 'openInExternalApp', where]);

    switch (where) {
      case 'window':
        window.open(url);

        break;

      case 'copy':
        copyToClipboard(dispatch, location.href);

        break;

      case 'osm.org':
        window.open(getOsmUrl(lat, lon, zoom, includePoint));

        break;

      case 'osm.org/id':
        window.open(getIdUrl(lat, lon, zoom));

        break;

      case 'josm': {
        let left;

        let right;

        let top;

        let bottom;

        if (includePoint) {
          const buffered = buffer(point([lon, lat]), 100, {
            units: 'meters',
            steps: 10,
          });

          if (!buffered) {
            throw new Error('empty buffer');
          }

          [left, bottom, right, top] = bbox(buffered);
        } else {
          const bounds = (await mapPromise).getBounds();

          left = bounds.getWest();

          right = bounds.getEast();

          top = bounds.getNorth();

          bottom = bounds.getSouth();
        }

        const url = new URL('http://localhost:8111/load_and_zoom');

        url.search = new URLSearchParams({
          left: String(left),
          right: String(right),
          top: String(top),
          bottom: String(bottom),
        }).toString();

        function assertOk(res: Response) {
          if (!res.ok) {
            throw new Error(
              'Error response from localhost:8111: ' + res.status,
            );
          }
        }

        fetch(url.toString())
          .then((res) => {
            assertOk(res);

            if (includePoint) {
              const url = new URL('http://localhost:8111/add_node');

              const usp = new URLSearchParams({
                lat: String(lat),
                lon: String(lon),
              });

              if (pointTitle) {
                usp.set('addtags', `name=${pointTitle}`);
              }

              url.search = usp.toString();

              return fetch(url.toString()).then((res) => {
                assertOk(res);
              });
            }
          })
          .catch((err) => {
            dispatch(
              toastsAdd({
                messageKey: 'general.operationError',
                messageParams: { err },
                style: 'danger',
              }),
            );
          });

        break;
      }

      case 'zbgis':
        window.open(getZbgisUrl(lat, lon, zoom));

        break;

      case 'hiking.sk': {
        window.open(getHikingSkUrl(lat, lon, zoom, includePoint));

        break;
      }

      case 'google':
        window.open(getGoogleUrl(lat, lon, zoom, includePoint));

        break;

      case 'peakfinder':
        window.open(getPeakfinderUrl(lat, lon));

        break;

      case 'mapy.cz':
        window.open(getMapyCzUrl(lat, lon, zoom, includePoint));

        break;

      case 'oma.sk':
        window.open(getOmaUrl(lat, lon, zoom, mapType));

        break;

      case 'openstreetcam':
        window.open(getOpenStreetCamUrl(lat, lon, zoom));

        break;

      case 'mapillary':
        window.open(getMapillaryUrl(lat, lon, zoom));

        break;

      case 'waze':
        window.open(getWazeUrl(lat, lon, zoom));

        break;

      case 'f4map':
        window.open(getF4mapUrl(lat, lon, zoom));

        break;

      case 'url':
        window.navigator
          .share({
            title: pointTitle,
            text: pointDescription,
            url: url || window.location.href,
          })
          .catch((err: unknown) => {
            dispatch(
              toastsAdd({
                messageKey: 'general.operationError',
                messageParams: { err },
                style: 'danger',
              }),
            );
          });

        break;

      case 'image':
        {
          const share = async () => {
            if (!url) {
              throw new Error('missong url');
            }

            const response = await fetch(url);

            const filesArray = [
              new File([await response.blob()], 'picture.jpg', {
                type: 'image/jpeg',
              }),
            ];

            if (!window.navigator.canShare({ files: filesArray })) {
              throw new Error("can't share");
            }

            await window.navigator.share({
              files: filesArray,
              title: pointTitle,
              text: pointDescription,
            });
          };

          share().catch((err) => {
            dispatch(
              toastsAdd({
                messageKey: 'general.operationError',
                messageParams: { err },
                style: 'danger',
              }),
            );
          });
        }

        break;

      default:
        break;
    }
  },
};
