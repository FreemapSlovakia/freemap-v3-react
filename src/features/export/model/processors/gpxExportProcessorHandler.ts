import { setActiveModal } from '@app/store/actions.js';
import type { ProcessorHandler } from '@app/store/middleware/processorMiddleware.js';
import { DrawingLinesState } from '@features/drawing/model/reducers/drawingLinesReducer.js';
import { DrawingPointsState } from '@features/drawing/model/reducers/drawingPointsReducer.js';
import { ObjectsState } from '@features/objects/model/reducer.js';
import { RoutePlannerState } from '@features/routePlanner/model/reducer.js';
import { TrackingState } from '@features/tracking/model/reducer.js';
import { TrackViewerState } from '@features/trackViewer/model/reducer.js';
import { escapeHtml } from '@shared/stringUtils.js';
import type { LatLon } from '@shared/types/common.js';
import { Feature, FeatureCollection } from 'geojson';
import { colors } from '../../../../constants.js';
import { fetchPictures, Picture } from '../../fetchPictures.js';
import {
  addAttribute,
  createElement,
  GARMIN_NS,
  GPX_NS,
  GPX_STYLE_NS,
  LOCUS_NS,
} from '../../gpxExporter.js';
import { upload } from '../../upload.js';
import { exportMapFeatures } from '../actions.js';

// TODO instead of creating XML directly, create JSON and serialize it to XML

const handle: ProcessorHandler<typeof exportMapFeatures> = async ({
  getState,
  action,
  dispatch,
}) => {
  const doc = document.implementation.createDocument(GPX_NS, 'gpx', null);

  doc.documentElement.setAttributeNS(
    'http://www.w3.org/2001/XMLSchema-instance',
    'schemaLocation',
    `${GPX_NS} http://www.topografix.com/GPX/1/1/gpx.xsd
      ${GARMIN_NS} https://www8.garmin.com/xmlschemas/GpxExtensionsv3.xsd
      ${GPX_STYLE_NS} https://www.topografix.com/GPX/gpx_style/0/2/gpx_style.xsd`,
  );

  doc.documentElement.setAttribute('xmlns:locus', LOCUS_NS);

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
    search,
    l10n: { language },
  } = getState();

  const set = new Set(action.payload.exportables);

  if (set.has('pictures')) {
    addPictures(doc, await fetchPictures(getState), language);
  }

  if (set.has('drawingLines')) {
    addDrawingLines(doc, drawingLines, 'line');
  }

  if (set.has('drawingAreas')) {
    addDrawingLines(doc, drawingLines, 'polygon');
  }

  if (set.has('drawingPoints')) {
    addDrawingPoints(doc, drawingPoints);
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

  if (set.has('search')) {
    const geojson = search.selectedResult?.geojson;

    if (geojson) {
      addGeojson(doc, geojson);
    }
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

  const { target } = action.payload;

  if (
    await upload(
      'gpx',
      new Blob([new XMLSerializer().serializeToString(doc)], {
        type:
          target === 'dropbox'
            ? 'application/octet-stream' /* 'application/gpx+xml' is denied */
            : 'application/gpx+xml',
      }),
      target,
      getState,
      dispatch,
    )
  ) {
    dispatch(setActiveModal(null));
  }
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
    hmac,
  } of pictures) {
    const wptEle = createElement(doc.documentElement, 'wpt', undefined, {
      lat: String(lat),
      lon: String(lon),
    });

    if (takenAt) {
      createElement(wptEle, 'time', new Date(takenAt * 1000).toISOString());
    }

    if (title) {
      createElement(wptEle, 'name', title);
    }

    const gm = window.translations?.gallery;

    const lines: [string, string][] = [];

    lines.push([gm?.filterModal.author ?? 'Author', user]);

    if (description) {
      lines.push([gm?.filterModal.takenAt ?? 'Capture date', description]);
    }

    if (createdAt) {
      lines.push([
        gm?.filterModal.createdAt ?? 'Upload date',
        new Date(createdAt * 1000).toLocaleString(lang),
      ]);
    }

    if (takenAt) {
      lines.push([
        gm?.filterModal.takenAt ?? 'Taken at',
        new Date(takenAt * 1000).toLocaleString(lang),
      ]);
    }

    lines.push([gm?.editForm.tags ?? 'Tags', tags.join(', ') || '-']);

    // 3.5: ★★★⯪☆
    const ratingFract = rating - Math.floor(rating);

    lines.push([
      gm?.filterModal.rating ?? 'Rating',
      '★'.repeat(Math.floor(rating)) +
        (ratingFract < 0.25 ? '☆' : ratingFract < 0.75 ? '⯪' : '★') +
        '☆'.repeat(4 - Math.floor(rating)),
    ]);

    let imageUrl = `${process.env['API_URL']}/gallery/pictures/${id}/image`;

    if (hmac) {
      imageUrl += '&hmac=' + encodeURIComponent(hmac);
    }

    createElement(wptEle, 'desc', {
      cdata:
        `<img src="${escapeHtml(imageUrl)}" width="100%"><p>` +
        lines
          .map(
            ([key, value]) => `<b>${escapeHtml(key)}</b>: ` + escapeHtml(value),
          )
          .join('｜') +
        '</p>',
    });

    const link1 = createElement(wptEle, 'link', undefined, {
      href: `${location.origin}?image=${id}`,
    });

    createElement(link1, 'text', gm?.linkToWww ?? 'photo at www.freemap.sk');

    createElement(link1, 'type', 'text/html');

    const link2 = createElement(wptEle, 'link', undefined, {
      href: imageUrl,
    });

    createElement(link2, 'text', gm?.linkToImage ?? 'photo image file');

    createElement(link2, 'type', 'image/jpeg');

    // TODO add comments to cmt?
  }
}

function addDrawingLines(
  doc: Document,
  { lines }: DrawingLinesState,
  type: 'polygon' | 'line',
) {
  for (const line of lines.filter((line) => line.type === type)) {
    const trkEle = createElement(doc.documentElement, 'trk');

    if (line.label) {
      createElement(trkEle, 'name', line.label);
    }

    const extEle = createElement(trkEle, 'extensions');

    const color = (line.color ?? colors.normal).slice(1);

    if (type === 'polygon') {
      const fillStyleEle = createElement(extEle, [GPX_STYLE_NS, 'fill']);

      createElement(fillStyleEle, [GPX_STYLE_NS, 'color'], color);

      createElement(fillStyleEle, [GPX_STYLE_NS, 'opacity'], '0.33');
    }

    const lineStyleEle = createElement(extEle, [GPX_STYLE_NS, 'line']);

    createElement(lineStyleEle, [GPX_STYLE_NS, 'color'], color);

    createElement(
      lineStyleEle,
      [GPX_STYLE_NS, 'width'],
      String(line.width || 4),
    );

    const ext2Ele = createElement(lineStyleEle, 'extensions');

    createElement(ext2Ele, [LOCUS_NS, 'locus:lsColorBase'], '#ff' + color);

    createElement(
      ext2Ele,
      [LOCUS_NS, 'locus:lsWidth'],
      String(line.width ?? 4),
    );

    createElement(ext2Ele, [LOCUS_NS, 'locus:lsUnits'], 'PIXELS');

    if (type === 'polygon') {
      createElement(ext2Ele, [LOCUS_NS, 'locus:lsColorFill'], '#60' + color);
    }

    const trksegEle = createElement(trkEle, 'trkseg');

    const points =
      type === 'line' ? line.points : [...line.points, line.points[0]];

    for (const { lat, lon } of points) {
      createElement(trksegEle, 'trkpt', undefined, toLatLon({ lat, lon }));
    }
  }
}

function addDrawingPoints(doc: Document, { points }: DrawingPointsState) {
  for (const { coords, label, color } of points) {
    const wptEle = createElement(
      doc.documentElement,
      'wpt',
      undefined,
      toLatLon(coords),
    );

    if (label) {
      createElement(wptEle, 'name', label);
    }

    const extEle = createElement(wptEle, 'extensions');

    const canvas = document.createElement('canvas');

    canvas.width = 64;

    canvas.height = 64;

    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.beginPath();

      ctx.closePath();

      ctx.beginPath();

      ctx.moveTo(32, 58);

      ctx.arc(32, 24, 18, Math.PI - Math.PI / 6, Math.PI / 6);

      ctx.closePath();

      ctx.fillStyle = color || colors.normal;

      ctx.fill();

      createElement(extEle, [LOCUS_NS, 'locus:icon'], canvas.toDataURL());
    }
  }
}

function addObjects(doc: Document, { objects }: ObjectsState) {
  for (const { coords, tags } of objects) {
    const wptEle = createElement(
      doc.documentElement,
      'wpt',
      undefined,
      toLatLon(coords),
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
  { alternatives, points, finishOnly }: RoutePlannerState,
  withStops: boolean,
) {
  // TODO add itinerar details and metadata
  // TODO add option to only export selected alternative

  if (withStops) {
    points.forEach((point, i: number) => {
      const midpointWptEle = createElement(
        doc.documentElement,
        'wpt',
        undefined,
        toLatLon(point),
      );

      createElement(
        midpointWptEle,
        'name',
        i === 0 && !finishOnly
          ? window.translations?.routePlanner.start
          : i === points.length - 1
            ? window.translations?.routePlanner.finish // TODO not for roundtrip?
            : window.translations?.routePlanner.stop + ' ' + (i + 1),
      );
    });
  }

  alternatives.forEach(({ legs }, i: number) => {
    const trkEle = createElement(doc.documentElement, 'trk');

    createElement(
      trkEle,
      'name',
      window.translations?.routePlanner.alternative + ' ' + (i + 1),
    );

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
    addGeojson(doc, trackGeojson);
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

function addGeojson(doc: Document, geojson: Feature | FeatureCollection) {
  for (const pass of ['wpt', 'trk'] as const) {
    for (const feature of geojson.type === 'FeatureCollection'
      ? geojson.features
      : [geojson]) {
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

        // eslint-disable-next-line no-fallthrough
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
