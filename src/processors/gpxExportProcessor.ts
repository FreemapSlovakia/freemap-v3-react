import FileSaver from 'file-saver';
import { exportGpx, setActiveModal } from 'fm3/actions/mainActions';
import { toastsAdd } from 'fm3/actions/toastsActions';
import { httpRequest } from 'fm3/authAxios';
import { createFilter } from 'fm3/galleryUtils';
import { getAuth2, loadGapi } from 'fm3/gapiLoader';
import { addAttribute, createElement, GPX_NS } from 'fm3/gpxExporter';
import { getMapLeafletElement } from 'fm3/leafletElementHolder';
import { Processor } from 'fm3/middlewares/processorMiddleware';
import { DrawingLinesState } from 'fm3/reducers/drawingLinesReducer';
import { DrawingPointsState } from 'fm3/reducers/drawingPointsReducer';
import { ObjectsState } from 'fm3/reducers/objectsReducer';
import { RoutePlannerState } from 'fm3/reducers/routePlannerReducer';
import { TrackingState } from 'fm3/reducers/trackingReducer';
import { TrackViewerState } from 'fm3/reducers/trackViewerReducer';
import { LatLon } from 'fm3/types/common';
import qs from 'query-string';
import { assertType } from 'typescript-is';

type Picture = {
  lat: number;
  lon: number;
  id: number;
  takenAt: string | null;
  title: string | null;
  description: string | null;
};

export const gpxExportProcessor: Processor<typeof exportGpx> = {
  actionCreator: exportGpx,
  errorKey: 'gpxExport.exportError',
  id: 'gpxExport',
  handle: async ({ getState, action, dispatch }) => {
    const doc = document.implementation.createDocument(GPX_NS, 'gpx', null);

    addAttribute(doc.documentElement, 'version', '1.1');

    addAttribute(doc.documentElement, 'creator', 'https://www.freemap.sk/');

    const meta = createElement(doc.documentElement, 'metadata');

    createElement(meta, 'desc', 'Exported from https://www.freemap.sk/');

    const author = createElement(meta, 'author');

    createElement(author, 'name', 'Freemap Slovakia');

    createElement(author, 'email', undefined, {
      id: 'freemap',
      domain: 'freemap.sk',
    });

    const link = createElement(author, 'link', undefined, {
      href: 'https://www.freemap.sk/',
    });

    createElement(link, 'text', 'Freemap Slovakia');

    createElement(link, 'type', 'text/html');

    const copyright = createElement(meta, 'copyright', undefined, {
      author: 'OpenStreetMap contributors',
    });

    createElement(
      copyright,
      'license',
      'http://www.openstreetmap.org/copyright',
    );

    createElement(meta, 'time', new Date().toISOString());

    createElement(meta, 'keywords', action.payload.exportables.join(' '));

    const {
      drawingLines,
      drawingPoints,
      objects,
      routePlanner,
      tracking,
      trackViewer,
    } = getState();

    const set = new Set(action.payload.exportables);

    const le = getMapLeafletElement();

    if (le && set.has('pictures')) {
      const b = le.getBounds();

      const { data } = await httpRequest({
        getState,
        method: 'GET',
        url: '/gallery/pictures',
        params: {
          by: 'bbox',
          bbox: `${b.getWest()},${b.getSouth()},${b.getEast()},${b.getNorth()}`,
          ...createFilter(getState().gallery.filter),
          fields: ['id', 'title', 'description', 'takenAt'],
        },
        paramsSerializer: qs.stringify,
        expectedStatus: 200,
      });

      addPictures(doc, assertType<Picture[]>(data));
    }

    if (set.has('drawingLines')) {
      addADMeasurement(doc, drawingLines, 'line');
    }

    if (set.has('areaMeasurement')) {
      addADMeasurement(doc, drawingLines, 'polygon');
    }

    if (set.has('drawingPoints')) {
      addInfoPoint(doc, drawingPoints);
    }

    if (set.has('objects')) {
      addObjects(doc, objects);
    }

    if (set.has('plannedRoute') || set.has('plannedRouteWithStops')) {
      addPlannedRoute(doc, routePlanner, set.has('plannedRouteWithStops'));
    }

    if (set.has('tracking')) {
      addTracking(doc, tracking);
    }

    if (set.has('gpx')) {
      addGpx(doc, trackViewer);
    }

    // order nodes

    const r = getSupportedGpxElements(doc);

    const q: Record<string, Node[]> = {
      wpt: [],
      rte: [],
      trk: [],
    };

    let curr: Node | null;

    while ((curr = r.iterateNext())) {
      q[curr.nodeName].push(curr);
    }

    for (const nodeName of ['wpt', 'rte', 'trk']) {
      for (const node of q[nodeName]) {
        doc.documentElement.appendChild(node);
      }
    }

    const serializer = new XMLSerializer();

    switch (action.payload.destination) {
      case 'dropbox': {
        const redirUri = encodeURIComponent(
          `${location.protocol}//${location.host}/dropboxAuthCallback.html`,
        );

        const w = window.open(
          `https://www.dropbox.com/oauth2/authorize?client_id=vnycfeumo6jzg5p&response_type=token&redirect_uri=${redirUri}`,
          'freemap-dropbox',
          'height=400,width=600',
        );

        if (!w) {
          dispatch(
            toastsAdd({
              id: 'gpxExport',
              messageKey: 'gpxExport.blockedPopup',
              style: 'danger',
              timeout: 5000,
            }),
          );

          return;
        }

        const p = new Promise<string | void>((resolve, reject) => {
          const msgListener = (e: MessageEvent) => {
            if (
              e.origin === window.location.origin &&
              typeof e.data === 'object' &&
              typeof e.data.freemap === 'object' &&
              e.data.freemap.action === 'dropboxAuth'
            ) {
              const { access_token: accessToken, error } = qs.parse(
                e.data.freemap.payload.slice(1),
              );

              if (accessToken) {
                resolve(
                  Array.isArray(accessToken) ? accessToken[0] : accessToken,
                );
              } else {
                reject(new Error(`OAuth: ${error}`));
              }

              w.close();
            }
          };

          const timer = window.setInterval(() => {
            if (w.closed) {
              window.clearInterval(timer);

              window.removeEventListener('message', msgListener);

              resolve();
            }
          }, 500);

          window.addEventListener('message', msgListener);
        });

        const authToken = await p; // TODO handle error (https://www.oauth.com/oauth2-servers/authorization/the-authorization-response/)

        if (authToken === undefined) {
          return;
        }

        await httpRequest({
          getState,
          method: 'POST',
          url: 'https://content.dropboxapi.com/2/files/upload',
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/octet-stream',
            'Dropbox-API-Arg': JSON.stringify({
              path: `/freemap-export-${new Date().toISOString()}.gpx`,
            }),
          },
          data: new Blob([serializer.serializeToString(doc)], {
            type: 'application/octet-stream', // NOTE 'application/gpx+xml' is denied
          }),
          expectedStatus: 200,
        });

        dispatch(
          toastsAdd({
            id: 'gpxExport',
            style: 'info',
            timeout: 5000,
            messageKey: 'gpxExport.exportedToDropbox',
          }),
        );

        break;
      }
      case 'gdrive':
        {
          await loadGapi();

          await new Promise<void>((resolve) => {
            gapi.load('picker', () => {
              resolve();
            });
          });

          // await new Promise(resolve => {
          //   gapi.client.load('drive', 'v3', resolve);
          // });

          await getAuth2({
            scope: 'https://www.googleapis.com/auth/drive.file',
          });

          const auth2 = gapi.auth2.getAuthInstance();

          const result = await auth2.signIn({
            scope: 'https://www.googleapis.com/auth/drive.file',
          });

          const ar = result.getAuthResponse();

          const folder = await new Promise<any>((resolve) => {
            const pkr = google.picker;

            new pkr.PickerBuilder()
              .addView(
                new pkr.DocsView(pkr.ViewId.FOLDERS).setSelectFolderEnabled(
                  true,
                ),
              )
              .setOAuthToken(ar.access_token)
              .setDeveloperKey('AIzaSyC90lMoeLp_Rbfpv-eEOoNVpOe25CNXhFc')
              .setCallback(pickerCallback)
              .setTitle('Select a folder')
              .build()
              .setVisible(true);

            function pickerCallback(data: any) {
              switch (data[pkr.Response.ACTION]) {
                case pkr.Action.PICKED:
                  resolve(data[pkr.Response.DOCUMENTS][0]);
                  break;
                case pkr.Action.CANCEL:
                  resolve(undefined);
                  break;
              }
            }
          });

          if (!folder) {
            return; // don't close export dialog
          }

          const formData = new FormData();

          formData.append(
            'metadata',
            new Blob(
              [
                JSON.stringify({
                  name: `freemap-export-${new Date().toISOString()}.gpx`,
                  mimeType: 'application/gpx+xml',
                  parents: [folder.id],
                }),
              ],
              { type: 'application/json' },
            ),
          );

          formData.append(
            'file',
            new Blob([serializer.serializeToString(doc)], {
              type: 'application/gpx+xml',
            }),
          );

          await httpRequest({
            getState,
            method: 'POST',
            url:
              'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id',
            headers: { Authorization: `Bearer ${ar.access_token}` },
            data: formData,
            expectedStatus: 200,
          });
        }

        dispatch(
          toastsAdd({
            id: 'gpxExport',
            style: 'info',
            timeout: 5000,
            messageKey: 'gpxExport.exportedToGdrive',
          }),
        );

        break;
      case 'download':
        FileSaver.saveAs(
          new Blob([serializer.serializeToString(doc)], {
            type: 'application/gpx+xml',
          }),
          `freemap-export-${new Date().toISOString()}.gpx`,
        );

        break;
    }

    dispatch(setActiveModal(null));
  },
};

function addPictures(doc: Document, pictures: Picture[]) {
  pictures.forEach(({ lat, lon, id, takenAt, title, description }) => {
    const wptEle = createElement(doc.documentElement, 'wpt', undefined, {
      lat: String(lat),
      lon: String(lon),
    });

    if (takenAt) {
      createElement(wptEle, 'time', takenAt);
    }

    if (title) {
      createElement(wptEle, 'name', title);
    }

    if (description) {
      createElement(wptEle, 'description', description);
    }

    const link = createElement(wptEle, 'link', undefined, {
      href: `${process.env['API_URL']}/gallery/pictures/${id}/image`,
    });

    createElement(link, 'type', 'image/jpeg');

    // TODO add tags and author to cmt
  });
}

function addADMeasurement(
  doc: Document,
  { lines }: DrawingLinesState,
  type: 'polygon' | 'line',
) {
  for (const line of lines.filter((line) => line.type === type)) {
    const trkEle = createElement(doc.documentElement, 'trk');

    if (line.label) {
      createElement(trkEle, 'name', line.label);
    }

    const trksegEle = createElement(trkEle, 'trkseg');

    const points =
      type === 'line' ? line.points : [...line.points, line.points[0]];

    for (const { lat, lon } of points) {
      createElement(trksegEle, 'trkpt', undefined, toLatLon({ lat, lon }));
    }
  }
}

function addInfoPoint(doc: Document, { points }: DrawingPointsState) {
  points.forEach(({ lat, lon, label }) => {
    const wptEle = createElement(
      doc.documentElement,
      'wpt',
      undefined,
      toLatLon({
        lat,
        lon,
      }),
    );

    if (label) {
      createElement(wptEle, 'name', label);
    }
  });
}

function addObjects(doc: Document, { objects }: ObjectsState) {
  objects.forEach(({ lat, lon, tags }) => {
    const wptEle = createElement(
      doc.documentElement,
      'wpt',
      undefined,
      toLatLon({
        lat,
        lon,
      }),
    );

    if (!Number.isNaN(parseFloat(tags['ele']))) {
      createElement(wptEle, 'ele', tags['ele']);
    }

    if (tags['name']) {
      createElement(wptEle, 'name', tags['name']);
    }
  });
}

function addPlannedRoute(
  doc: Document,
  { alternatives, start, finish, midpoints }: RoutePlannerState,
  withStops: boolean,
) {
  // TODO add itinerar details and metadata
  // TODO add option to only export selected alternative

  if (withStops) {
    if (start) {
      const startWptEle = createElement(
        doc.documentElement,
        'wpt',
        undefined,
        toLatLon(start),
      );

      createElement(startWptEle, 'name', 'Štart');
    }

    if (finish) {
      const finishWptEle = createElement(
        doc.documentElement,
        'wpt',
        undefined,
        toLatLon(finish),
      );

      createElement(finishWptEle, 'name', 'Cieľ');
    }

    midpoints.forEach((midpoint, i: number) => {
      const midpointWptEle = createElement(
        doc.documentElement,
        'wpt',
        undefined,
        toLatLon(midpoint),
      );

      createElement(midpointWptEle, 'name', `Zastávka ${i + 1}`);
    });
  }

  alternatives.forEach(({ legs }, i: number) => {
    const trkEle = createElement(doc.documentElement, 'trk');

    createElement(trkEle, 'name', `Alternatíva ${i + 1}`);

    const trksegEle = createElement(trkEle, 'trkseg');

    for (const leg of legs) {
      for (const step of leg.steps) {
        for (const [lon, lat] of step.geometry.coordinates) {
          createElement(trksegEle, 'trkpt', undefined, toLatLon({ lat, lon }));
        }
      }
    }
  });
}

function toLatLon(latLon: LatLon) {
  return {
    lat: latLon.lat.toString(),
    lon: latLon.lon.toString(),
  };
}

const FM_NS = 'https://www.freemap.sk/GPX/1/0';

function addTracking(doc: Document, { tracks, trackedDevices }: TrackingState) {
  const tdMap = new Map(trackedDevices.map((td) => [td.id, td]));

  const tracks1 = tracks.map((track) => ({
    ...track,
    ...(tdMap.get(track.id) || {}),
  }));

  for (const track of tracks1) {
    const trkEle = createElement(doc.documentElement, 'trk');

    if (track.label) {
      createElement(trkEle, 'name', track.label);
    }

    const trksegEle = createElement(trkEle, 'trkseg');

    for (const {
      ts,
      lat,
      lon,
      altitude,
      speed,
      accuracy,
      bearing,
      battery,
      gsmSignal,
      message,
    } of track.trackPoints) {
      const ptEle = createElement(
        trksegEle,
        'trkpt',
        undefined,
        toLatLon({ lat, lon }),
      );

      createElement(ptEle, 'time', ts.toISOString());

      if (typeof altitude === 'number') {
        createElement(ptEle, 'ele', altitude.toString());
      }

      if (typeof accuracy === 'number') {
        createElement(ptEle, 'hdop', accuracy.toString());
      }

      if (typeof bearing === 'number') {
        createElement(ptEle, 'magvar', bearing.toString()); // maybe not the most suitable tag
      }

      if (message && typeof accuracy === 'number') {
        createElement(ptEle, 'cmt', accuracy.toString());
      }

      if (
        typeof speed === 'number' ||
        typeof battery === 'number' ||
        typeof gsmSignal === 'number'
      ) {
        const extEl = createElement(ptEle, 'extensions');

        if (typeof speed === 'number') {
          const elem = document.createElementNS(FM_NS, 'speed');
          elem.textContent = speed.toString();
          extEl.appendChild(elem);
        }

        if (typeof battery === 'number') {
          const elem = document.createElementNS(FM_NS, 'battery');
          elem.textContent = battery.toString();
          extEl.appendChild(elem);
        }

        if (typeof gsmSignal === 'number') {
          const elem = document.createElementNS(FM_NS, 'gsm_signal');
          elem.textContent = gsmSignal.toString();
          extEl.appendChild(elem);
        }
      }
    }
  }
}

function addGpx(doc: Document, { trackGpx, trackGeojson }: TrackViewerState) {
  if (trackGpx) {
    const domParser = new DOMParser();

    const gpxDoc: XMLDocument = domParser.parseFromString(trackGpx, 'text/xml');

    const r = getSupportedGpxElements(gpxDoc);

    const nodes: Node[] = [];

    let curr: Node | null;

    while ((curr = r.iterateNext())) {
      nodes.push(curr);
    }

    for (const node of nodes) {
      doc.documentElement.appendChild(node);
    }
  } else if (trackGeojson) {
    for (const pass of ['wpt', 'trk'] as const) {
      for (const feature of trackGeojson.features) {
        const g = feature.geometry;

        switch (g.type) {
          case 'Point':
            if (pass === 'wpt') {
              const wptEle = createElement(
                doc.documentElement,
                'wpt',
                undefined,
                toLatLon({
                  lat: g.coordinates[1],
                  lon: g.coordinates[0],
                }),
              );

              if (feature.properties?.['ele']) {
                createElement(wptEle, 'ele', feature.properties['ele']);
              }

              if (feature.properties?.['name']) {
                createElement(wptEle, 'name', feature.properties['name']);
              }
            }
            break;
          case 'MultiPoint': {
            if (pass === 'wpt') {
              for (const pt of g.coordinates) {
                const wptEle = createElement(
                  doc.documentElement,
                  'wpt',
                  undefined,
                  toLatLon({
                    lat: pt[1],
                    lon: pt[0],
                  }),
                );

                if (feature.properties?.['ele']) {
                  createElement(wptEle, 'ele', feature.properties['ele']);
                }

                if (feature.properties?.['name']) {
                  createElement(wptEle, 'name', feature.properties['name']);
                }
              }
            }

            break;
          }
          case 'LineString': {
            if (pass === 'trk') {
              const trkEle = createElement(doc.documentElement, 'trk');

              if (feature.properties?.['name']) {
                createElement(trkEle, 'name', feature.properties['name']);
              }

              const trksegEle = createElement(trkEle, 'trkseg');

              for (const pt of g.coordinates) {
                createElement(
                  trksegEle,
                  'trkpt',
                  undefined,
                  toLatLon({ lat: pt[1], lon: pt[0] }),
                );
              }
            }

            break;
          }
          case 'Polygon':
          case 'MultiLineString':
            if (pass === 'trk') {
              const trkEle = createElement(doc.documentElement, 'trk');

              if (feature.properties?.['name']) {
                createElement(trkEle, 'name', feature.properties['name']);
              }

              for (const seg of g.coordinates) {
                const trksegEle = createElement(trkEle, 'trkseg');

                for (const pt of seg) {
                  createElement(
                    trksegEle,
                    'trkpt',
                    undefined,
                    toLatLon({ lat: pt[1], lon: pt[0] }),
                  );
                }
              }
            }

            break;
          case 'MultiPolygon':
            if (pass === 'trk') {
              const trkEle = createElement(doc.documentElement, 'trk');

              if (feature.properties?.['name']) {
                createElement(trkEle, 'name', feature.properties['name']);
              }

              for (const seg0 of g.coordinates) {
                for (const seg of seg0) {
                  const trksegEle = createElement(trkEle, 'trkseg');

                  for (const pt of seg) {
                    createElement(
                      trksegEle,
                      'trkpt',
                      undefined,
                      toLatLon({ lat: pt[1], lon: pt[0] }),
                    );
                  }
                }
              }
            }

            break;
        }
      }
    }
  }
}

function getSupportedGpxElements(doc: Document) {
  return doc.evaluate(
    '/gpx:gpx/gpx:wpt | /gpx:gpx/gpx:rte | /gpx:gpx/gpx:trk',
    doc,
    (prefix) => (prefix === 'gpx' ? GPX_NS : null), // TODO add support also for 1.0
    XPathResult.UNORDERED_NODE_ITERATOR_TYPE,
    null,
  );
}

export default gpxExportProcessor;
