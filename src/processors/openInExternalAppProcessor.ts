import bbox from '@turf/bbox';
import buffer from '@turf/buffer';
import { point } from '@turf/helpers';
import { openInExternalApp } from 'fm3/actions/mainActions';
import { toastsAdd } from 'fm3/actions/toastsActions';
import { copyToClipboard } from 'fm3/clipboardUtils';
import {
  getGoogleUrl,
  getHikingSkUrl,
  getIdUrl,
  getMapillaryUrl,
  getMapyCzUrl,
  getOmaUrl,
  getOpenStreetCamUrl,
  getOsmUrl,
  getPeakfinderUrl,
  getTwitterUrl,
  getZbgisUrl,
} from 'fm3/externalUrlUtils';
import { loadFb } from 'fm3/fbLoader';
import { getMapLeafletElement } from 'fm3/leafletElementHolder';
import { Processor } from 'fm3/middlewares/processorMiddleware';
import popupCentered from 'popup-centered';

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

    switch (where) {
      case 'window':
        window.open(url);
        break;

      case 'facebook':
        loadFb().then(() => {
          FB.ui({
            method: 'share',
            hashtag: '#openstreetmap',
            href: location.href,
          });
        });

        break;

      case 'twitter':
        popupCentered(getTwitterUrl(), 'twitter', 575, 280);
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
        const leaflet = getMapLeafletElement();

        if (leaflet) {
          let left: number;
          let right: number;
          let top: number;
          let bottom: number;

          if (includePoint) {
            [left, bottom, right, top] = bbox(
              buffer(point([lon, lat]), 100, { units: 'meters', steps: 10 }),
            );
          } else {
            const bounds = leaflet.getBounds();

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

                url.search = new URLSearchParams({
                  lat: String(lat),
                  lon: String(lon),
                  addtags: `name=${pointTitle}`,
                }).toString();

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
        }
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

      case 'url':
        (navigator as any)
          .share({
            title: pointTitle,
            text: pointDescription,
            url: url || window.location,
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
          const nav = navigator as any;

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

            if (!nav.canShare({ files: filesArray })) {
              throw new Error("can't share");
            }

            await nav.share({
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
