import { openInExternalApp } from '@app/store/actions.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { mapPromise } from '@features/map/hooks/leafletElementHolder.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { copyToClipboard } from '@shared/clipboardUtils.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import { shareViaSheet } from '@shared/webShare.js';
import { bbox } from '@turf/bbox';
import { buffer } from '@turf/buffer';
import { point } from '@turf/helpers';
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
} from './externalUrlUtils.js';

/**
 * What the shared picture is called where it lands. The photo's own title is the name a recipient
 * would recognize, reduced to what every filesystem takes; a photo without one falls back to the
 * site's name. The extension comes from the type the server actually served.
 */
function imageFileName(title: string | undefined, mime: string): string {
  // `image/jpeg` → `jpg`, and a subtype carrying a suffix or parameters
  // (`image/svg+xml`, `image/png; charset=binary`) reduces to its bare name.
  const ext =
    mime
      .slice('image/'.length)
      .replace(/[;+].*$/, '')
      .trim()
      .replace(/^jpeg$/, 'jpg') || 'jpg';

  const stem =
    title
      ?.replace(/[^\p{L}\p{N} ._-]/gu, '')
      .trim()
      // A Commons title is the file name, extension and all, so keep exactly
      // one — the extension appended below, which names what the bytes are.
      .replace(/\.(jpe?g|png|gif|webp|tiff?|svg|bmp|avif|heic|heif)$/i, '')
      .trim()
      .slice(0, 80)
      .trim() || 'freemap-photo';

  return `${stem}.${ext}`;
}

export const openInExternalAppProcessor: Processor<typeof openInExternalApp> = {
  actionCreator: openInExternalApp,
  handle: async ({ action, getState, dispatch }) => {
    const {
      where,
      lat = getState().map.lat,
      lon = getState().map.lon,
      zoom: rawZoom = getState().map.zoom,
      includePoint,
      pointTitle,
      pointDescription,
      url,
      imageUrl,
    } = action.payload;

    // Whole levels only: several of the targets below — `geo:`, ZBGIS,
    // hiking.sk — take the zoom as an integer and make nothing of a fraction.
    const zoom = Math.round(rawZoom);

    trackMatomo(['trackEvent', 'Share', 'openExternal', where]);

    // Both share targets hand their outcome here. Dismissing the sheet rejects
    // with AbortError — closing what you just opened is not a failure to report
    // — but anything else is, including a share that never got a sheet at all:
    // the user tapped share, and silence is the one answer that leaves them
    // with nothing to act on.
    const reportShareProblem = (err: unknown) => {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return;
      }

      dispatch(
        toastsAdd({
          messageKey: 'general.operationError',
          messageParams: { err },
          style: 'danger',
        }),
      );
    };

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
              `Error response from localhost:8111: ${res.status}`,
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

      case 'mapy.com':
        window.open(getMapyCzUrl(lat, lon, zoom, includePoint));

        break;

      case 'oma.sk':
        window.open(getOmaUrl(lat, lon, zoom));

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

      case 'url': {
        const geo = `geo:${lat.toFixed(6)},${lon.toFixed(6)}?z=${zoom}`;

        const text = [pointDescription, geo].filter(Boolean).join('\n');

        shareViaSheet({
          title: pointTitle,
          text,
          url: url || window.location.href,
        })
          .then((shared) => {
            if (!shared) {
              throw new Error('another share is already open');
            }
          })
          .catch(reportShareProblem);

        break;
      }

      case 'image':
        {
          const share = async () => {
            if (!imageUrl) {
              throw new Error('missing image url');
            }

            const response = await fetch(imageUrl);

            if (!response.ok) {
              throw new Error(`fetching the picture: HTTP ${response.status}`);
            }

            const blob = await response.blob();

            // The server says what the picture is; a Commons original may well be a PNG. Anything
            // that doesn't answer with an image type is not one to name `.jpg` and hand on.
            if (!blob.type.startsWith('image/')) {
              throw new Error(`not an image: ${blob.type || 'no type'}`);
            }

            const filesArray = [
              new File([blob], imageFileName(pointTitle, blob.type), {
                type: blob.type,
              }),
            ];

            if (!window.navigator.canShare({ files: filesArray })) {
              throw new Error("can't share");
            }

            // The picture is fetched first, so another share tapped meanwhile
            // can reach the sheet ahead of this one — and by then the user may
            // have swiped to a different picture entirely. Whatever is on that
            // sheet, it is not what this asked for, so say so rather than
            // vanish.
            if (
              !(await shareViaSheet({
                files: filesArray,
                title: pointTitle,
                text: pointDescription,
              }))
            ) {
              throw new Error('another share is already open');
            }
          };

          share().catch(reportShareProblem);
        }

        break;

      default:
        break;
    }
  },
};
