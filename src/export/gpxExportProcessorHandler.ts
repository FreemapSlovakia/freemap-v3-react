import { exportGpx, setActiveModal } from 'fm3/actions/mainActions';
import { ProcessorHandler } from 'fm3/middlewares/processorMiddleware';
import { DrawingLinesState } from 'fm3/reducers/drawingLinesReducer';
import { DrawingPointsState } from 'fm3/reducers/drawingPointsReducer';
import { ObjectsState } from 'fm3/reducers/objectsReducer';
import { RoutePlannerState } from 'fm3/reducers/routePlannerReducer';
import { TrackingState } from 'fm3/reducers/trackingReducer';
import { TrackViewerState } from 'fm3/reducers/trackViewerReducer';
import { escapeHtml } from 'fm3/stringUtils';
import { LatLon } from 'fm3/types/common';
import { fetchPictures, Picture } from './fetchPictures';
import { addAttribute, createElement, GPX_NS } from './gpxExporter';
import { upload } from './upload';

// TODO instead of creating XML directly, create JSON and serialize it to XML

const handle: ProcessorHandler<typeof exportGpx> = async ({
  getState,
  action,
  dispatch,
}) => {
  const doc = document.implementation.createDocument(GPX_NS, 'gpx', null);

  doc.documentElement.setAttributeNS(
    'http://www.w3.org/2001/XMLSchema-instance',
    'schemaLocation',
    'http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd',
  );

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

  // TODO add other licences depending on exported items

  const copyright = createElement(meta, 'copyright', undefined, {
    author: 'OpenStreetMap contributors',
  });

  createElement(
    copyright,
    'license',
    'https://www.openstreetmap.org/copyright',
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
    l10n: { language },
  } = getState();

  const set = new Set(action.payload.exportables);

  if (set.has('pictures')) {
    addPictures(doc, await fetchPictures(getState), language);
  }

  if (set.has('drawingLines')) {
    addADMeasurement(doc, drawingLines, 'line');
  }

  if (set.has('drawingAreas')) {
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

  const { destination } = action.payload;

  await upload(
    'gpx',
    new Blob([new XMLSerializer().serializeToString(doc)], {
      type:
        destination === 'dropbox'
          ? 'application/octet-stream' /* 'application/gpx+xml' is denied */
          : 'application/gpx+xml',
    }),
    destination,
    getState,
    dispatch,
  );

  dispatch(setActiveModal(null));
};

export default handle;

function addPictures(doc: Document, pictures: Picture[], lang: string) {
  for (const {
    lat,
    lon,
    id,
    takenAt,
    createdAt,
    title,
    description,
    tags,
    rating,
    user,
  } of pictures) {
    const wptEle = createElement(doc.documentElement, 'wpt', undefined, {
      lat: String(lat),
      lon: String(lon),
    });

    if (takenAt) {
      createElement(wptEle, 'time', new Date(takenAt).toISOString());
    }

    if (title) {
      createElement(wptEle, 'name', title);
    }

    const lines: [string, string][] = [];

    lines.push([
      window.translations?.gallery.filterModal.author ?? 'Author',
      user,
    ]);

    if (description) {
      lines.push([
        window.translations?.gallery.filterModal.takenAt ?? 'Capture date',
        description,
      ]);
    }

    if (createdAt) {
      lines.push([
        window.translations?.gallery.filterModal.createdAt ?? 'Upload date',
        new Date(createdAt * 1000).toLocaleString(lang),
      ]);
    }

    if (takenAt) {
      lines.push([
        window.translations?.gallery.filterModal.takenAt ?? 'Taken at',
        new Date(takenAt * 1000).toLocaleString(lang),
      ]);
    }

    if (tags) {
      lines.push([
        window.translations?.gallery.editForm.tags ?? 'Tags',
        tags.join(', '),
      ]);
    }

    // 3.5: ★★★⯪☆
    const ratingFract = rating - Math.floor(rating);

    lines.push([
      window.translations?.gallery.filterModal.rating ?? 'Rating',
      '★'.repeat(Math.floor(rating)) +
        (ratingFract < 0.25 ? '☆' : ratingFract < 0.75 ? '⯪' : '★') +
        '☆'.repeat(4 - Math.floor(rating)),
    ]);

    createElement(wptEle, 'desc', {
      cdata:
        `<img src="${escapeHtml(
          `${process.env['API_URL']}/gallery/pictures/${id}/image`,
        )}" width="100%"><p>` +
        lines
          .map(
            ([key, value]) => `<b>${escapeHtml(key)}</b>: ` + escapeHtml(value),
          )
          .join('｜') +
        '</p>',
    });

    const link = createElement(wptEle, 'link', undefined, {
      href: `${process.env['BASE_URL']}?image=${id}`,
    });

    createElement(link, 'type', 'text/html');

    // TODO add comments to cmt?
  }
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
  for (const { lat, lon, label } of points) {
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
  }
}

function addObjects(doc: Document, { objects }: ObjectsState) {
  for (const { lat, lon, tags } of objects) {
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
  }
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

      createElement(startWptEle, 'name', 'Štart'); // TODO translate
    }

    if (finish) {
      const finishWptEle = createElement(
        doc.documentElement,
        'wpt',
        undefined,
        toLatLon(finish),
      );

      createElement(finishWptEle, 'name', 'Cieľ'); // TODO translate
    }

    midpoints.forEach((midpoint, i: number) => {
      const midpointWptEle = createElement(
        doc.documentElement,
        'wpt',
        undefined,
        toLatLon(midpoint),
      );

      createElement(midpointWptEle, 'name', `Zastávka ${i + 1}`); // TODO translate
    });
  }

  alternatives.forEach(({ legs }, i: number) => {
    const trkEle = createElement(doc.documentElement, 'trk');

    createElement(trkEle, 'name', `Alternatíva ${i + 1}`); // TODO translate

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
  const tdMap = new Map(trackedDevices.map((td) => [td.token, td]));

  const tracks1 = tracks.map((track) => ({
    ...track,
    ...(tdMap.get(track.token) || {}),
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

      if (typeof altitude === 'number') {
        createElement(ptEle, 'ele', altitude.toString());
      }

      createElement(ptEle, 'time', ts.toISOString());

      if (typeof bearing === 'number') {
        createElement(ptEle, 'magvar', bearing.toString()); // maybe not the most suitable tag
      }

      if (typeof accuracy === 'number') {
        createElement(ptEle, 'hdop', accuracy.toString());
      }

      if (message) {
        createElement(ptEle, 'desc', message);
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
