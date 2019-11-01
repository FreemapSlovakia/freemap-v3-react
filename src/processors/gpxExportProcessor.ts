import FileSaver from 'file-saver';
import { exportGpx, setActiveModal } from 'fm3/actions/mainActions';
import { httpRequest } from 'fm3/authAxios';
import { createFilter } from 'fm3/galleryUtils';
import { addAttribute, createElement, GPX_NS } from 'fm3/gpxExporter';
import { getMapLeafletElement } from 'fm3/leafletElementHolder';
import { Processor } from 'fm3/middlewares/processorMiddleware';
import qs from 'query-string';
import { RoutePlannerState } from 'fm3/reducers/routePlannerReducer';
import { LatLon } from 'fm3/types/common';
import { ObjectsState } from 'fm3/reducers/objectsReducer';
import { InfoPointState } from 'fm3/reducers/infoPointReducer';
import { ElevationMeasurementState } from 'fm3/reducers/elevationMeasurementReducer';
import { DistanceMeasurementState } from 'fm3/reducers/distanceMeasurementReducer';
import { TrackingState } from 'fm3/reducers/trackingReducer';

export const gpxExportProcessor: Processor<typeof exportGpx> = {
  actionCreator: exportGpx,
  errorKey: 'gpxExport.exportError',
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
    createElement(meta, 'keywords', action.payload.join(' '));

    const {
      distanceMeasurement,
      areaMeasurement,
      elevationMeasurement,
      infoPoint,
      objects,
      routePlanner,
      tracking,
      trackViewer,
    } = getState();

    const set = new Set(action.payload);
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

      addPictures(doc, data);
    }

    if (set.has('distanceMeasurement')) {
      addADMeasurement(doc, distanceMeasurement);
    }

    if (set.has('areaMeasurement')) {
      addADMeasurement(doc, areaMeasurement); // TODO add info about area
    }

    if (set.has('elevationMeasurement')) {
      addElevationMeasurement(doc, elevationMeasurement);
    }

    if (set.has('infoPoint')) {
      addInfoPoint(doc, infoPoint);
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

    const q = {
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

    FileSaver.saveAs(
      new Blob([serializer.serializeToString(doc)], {
        type: 'application/json',
      }),
      'export.gpx',
    );

    dispatch(setActiveModal(null));
  },
};

function addPictures(doc: Document, pictures) {
  pictures.forEach(({ lat, lon, id, takenAt, title, description }) => {
    const wptEle = createElement(doc.documentElement, 'wpt', undefined, {
      lat,
      lon,
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
      href: `${process.env.API_URL}/gallery/pictures/${id}/image`,
    });
    createElement(link, 'type', 'image/jpeg');

    // TODO add tags and author to cmt
  });
}

function addADMeasurement(doc: Document, { points }: DistanceMeasurementState) {
  const trkEle = createElement(doc.documentElement, 'trk');
  const trksegEle = createElement(trkEle, 'trkseg');

  if (points.length) {
    points.forEach(({ lat, lon }) => {
      createElement(trksegEle, 'trkpt', undefined, toLatLon({ lat, lon }));
    });
  }
}

function addElevationMeasurement(
  doc: Document,
  { point, elevation }: ElevationMeasurementState,
) {
  if (point) {
    const wptEle = createElement(
      doc.documentElement,
      'wpt',
      undefined,
      toLatLon({
        lat: point.lat,
        lon: point.lon,
      }),
    );
    if (elevation !== null) {
      createElement(wptEle, 'ele', elevation.toString());
    }
  }
}

function addInfoPoint(doc: Document, { points }: InfoPointState) {
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

    if (!Number.isNaN(parseFloat(tags.ele))) {
      createElement(wptEle, 'ele', tags.ele);
    }

    if (tags.name) {
      createElement(wptEle, 'name', tags.name);
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

  alternatives.forEach(({ itinerary }, i: number) => {
    const trkEle = createElement(doc.documentElement, 'trk');
    createElement(trkEle, 'name', `Alternatíva ${i + 1}`);
    const trksegEle = createElement(trkEle, 'trkseg');
    itinerary.forEach(({ shapePoints }) => {
      shapePoints.forEach(([lat, lon]) => {
        createElement(trksegEle, 'trkpt', undefined, toLatLon({ lat, lon }));
      });
    });
  });
}

function toLatLon(latLon: LatLon) {
  return {
    lat: latLon.lat.toString(),
    lon: latLon.lon.toString(),
  };
}

export const FM_NS = 'https://www.freemap.sk/GPX/1/0';

function addTracking(doc: Document, { tracks, trackedDevices }: TrackingState) {
  const tdMap = new Map(trackedDevices.map(td => [td.id, td]));
  const tracks1 = tracks.map(track => ({
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

function addGpx(doc: Document, { trackGpx }: { trackGpx: string | null }) {
  if (!trackGpx) {
    return;
  }

  const domParser = new DOMParser();
  const gpxDoc: XMLDocument = domParser.parseFromString(trackGpx, 'text/xml');

  const r = getSupportedGpxElements(gpxDoc);

  let curr: Node | null;
  while ((curr = r.iterateNext())) {
    doc.documentElement.appendChild(curr.cloneNode(true));
  }
}

function getSupportedGpxElements(doc: Document) {
  return doc.evaluate(
    '/gpx:gpx/gpx:wpt | /gpx:gpx/gpx:rte | /gpx:gpx/gpx:trk',
    doc,
    prefix => (prefix === 'gpx' ? GPX_NS : null), // TODO add support also for 1.0
    XPathResult.UNORDERED_NODE_ITERATOR_TYPE,
    null,
  );
}
