import axios from 'axios';
import { createLogic } from 'redux-logic';
import FileSaver from 'file-saver';
import qs from 'query-string';

import * as at from 'fm3/actionTypes';
import { createElement, addAttribute, GPX_NS } from 'fm3/gpxExporter';
import { startProgress, stopProgress, setActiveModal } from 'fm3/actions/mainActions';
import { toastsAddError } from 'fm3/actions/toastsActions';
import { getMapLeafletElement } from 'fm3/leafletElementHolder';
import { createFilter } from 'fm3/galleryUtils';

export const gpxExportLogic = createLogic({
  type: at.EXPORT_GPX,
  process({ getState, action, cancelled$, storeDispatch }, dispatch, done) {
    const doc = document.implementation.createDocument(GPX_NS, 'gpx', null);

    addAttribute(doc.documentElement, 'version', '1.1');
    addAttribute(doc.documentElement, 'creator', 'https://www.freemap.sk/');
    const meta = createElement(doc.documentElement, 'metadata');
    createElement(meta, 'desc', 'Exported from https://www.freemap.sk/');
    const author = createElement(meta, 'author');
    createElement(author, 'name', 'Freemap Slovakia');
    createElement(author, 'email', undefined, { id: 'freemap', domain: 'freemap.sk' });
    const link = createElement(author, 'link', undefined, { href: 'https://www.freemap.sk/' });
    createElement(link, 'text', 'Freemap Slovakia');
    createElement(link, 'type', 'text/html');
    const copyright = createElement(meta, 'copyright', undefined, { author: 'OpenStreetMap contributors' });
    createElement(copyright, 'license', 'http://www.openstreetmap.org/copyright');
    createElement(meta, 'time', new Date().toISOString());
    createElement(meta, 'keywords', action.payload.join(' '));

    const { distanceMeasurement, areaMeasurement, elevationMeasurement, infoPoint, objects, routePlanner, tracking } = getState();

    const set = new Set(action.payload);

    const promises = [];

    const pid = Math.random();
    dispatch(startProgress(pid));

    if (set.has('pictures')) {
      const source = axios.CancelToken.source();
      cancelled$.subscribe(() => {
        source.cancel();
      });

      const b = getMapLeafletElement().getBounds();

      const p = axios.get(`${process.env.API_URL}/gallery/pictures`, {
        params: {
          by: 'bbox',
          bbox: `${b.getWest()},${b.getSouth()},${b.getEast()},${b.getNorth()}`,
          ...createFilter(getState().gallery.filter),
          fields: ['id', 'title', 'description', 'takenAt'],
        },
        paramsSerializer: qs.stringify,
        validateStatus: status => status === 200,
        cancelToken: source.token,
      })
        .then(({ data }) => {
          addPictures(doc, data);
        })
        .catch((err) => {
          dispatch(toastsAddError('gallery.picturesFetchingError', err));
        });

      promises.push(p);
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
    if (set.has('plannedRoute')) {
      addPlannedRoute(doc, routePlanner);
    }
    if (set.has('tracking')) {
      addTracking(doc, tracking);
    }

    Promise.all(promises)
      .then(() => {
        storeDispatch(stopProgress(pid));
        const serializer = new XMLSerializer();

        // eslint-disable-next-line
        //console.log(serializer.serializeToString(doc));

        FileSaver.saveAs(new Blob([serializer.serializeToString(doc)], { type: 'application/json' }), 'export.gpx');
        dispatch(setActiveModal(null));
        done();
      });
  },
});

function addPictures(doc, pictures) {
  pictures.forEach(({
    lat, lon, id, takenAt, title, description,
  }) => {
    const wptEle = createElement(doc.documentElement, 'wpt', undefined, { lat, lon });
    if (takenAt) {
      createElement(wptEle, 'time', takenAt);
    }
    if (title) {
      createElement(wptEle, 'name', title);
    }
    if (description) {
      createElement(wptEle, 'description', description);
    }
    const link = createElement(wptEle, 'link', undefined, { href: `${process.env.API_URL}/gallery/pictures/${id}/image` });
    createElement(link, 'type', 'image/jpeg');

    // TODO add tags and author to cmt
  });
}

function addADMeasurement(doc, { points }) {
  const trkEle = createElement(doc.documentElement, 'trk');
  const trksegEle = createElement(trkEle, 'trkseg');

  if (points.length) {
    points.forEach(({ lat, lon }) => {
      createElement(trksegEle, 'trkpt', undefined, { lat, lon });
    });
  }
}

function addElevationMeasurement(doc, { point, elevation }) {
  if (point) {
    const wptEle = createElement(doc.documentElement, 'wpt', undefined, { lat: point.lat, lon: point.lon });
    createElement(wptEle, 'ele', elevation);
  }
}

function addInfoPoint(doc, { points }) {
  points.forEach(({ lat, lon, label }) => {
    const wptEle = createElement(doc.documentElement, 'wpt', undefined, { lat, lon });
    if (label) {
      createElement(wptEle, 'name', label);
    }
  });
}

function addObjects(doc, { objects }) {
  objects.forEach(({ lat, lon, tags }) => {
    const wptEle = createElement(doc.documentElement, 'wpt', undefined, { lat, lon });

    if (!Number.isNaN(tags.ele)) {
      createElement(wptEle, 'ele', tags.ele);
    }

    if (tags.name) {
      createElement(wptEle, 'name', tags.name);
    }
  });
}

function addPlannedRoute(doc, { alternatives, start, finish, midpoints }) {
  // TODO add itinerar details and metadata
  // TODO add option to only export selected alternative

  const startWptEle = createElement(doc.documentElement, 'wpt', undefined, start);
  createElement(startWptEle, 'name', 'Štart');

  const finishWptEle = createElement(doc.documentElement, 'wpt', undefined, finish);
  createElement(finishWptEle, 'name', 'Cieľ');

  midpoints.forEach((midpoint, i) => {
    const midpointWptEle = createElement(doc.documentElement, 'wpt', undefined, midpoint);
    createElement(midpointWptEle, 'name', `Zastávka ${i + 1}`);
  });

  alternatives.forEach(({ itinerary }, i) => {
    const trkEle = createElement(doc.documentElement, 'trk');
    createElement(trkEle, 'name', `Alternatíva ${i + 1}`);
    const trksegEle = createElement(trkEle, 'trkseg');
    itinerary.forEach(({ shapePoints }) => {
      shapePoints.forEach(([lat, lon]) => {
        createElement(trksegEle, 'trkpt', undefined, { lat, lon });
      });
    });
  });
}

export const FM_NS = 'https://www.freemap.sk/GPX/1/0';

function addTracking(doc, { tracks, trackedDevices }) {
  const tdMap = new Map(trackedDevices.map(td => [td.id, td]));
  const tracks1 = tracks.map(track => ({ ...track, ...(tdMap.get(track.id) || {}) }));

  for (const track of tracks1) {
    const trkEle = createElement(doc.documentElement, 'trk');
    if (track.label) {
      createElement(trkEle, 'name', track.label);
    }
    const trksegEle = createElement(trkEle, 'trkseg');
    for (const { ts, lat, lon, altitude, speed, accuracy, bearing, battery, gsmSignal, message } of track.trackPoints) {
      const ptEle = createElement(trksegEle, 'trkpt', undefined, { lat, lon });
      createElement(ptEle, 'time', ts);
      if (typeof altitude === 'number') {
        createElement(ptEle, 'ele', altitude);
      }
      if (typeof accuracy === 'number') {
        createElement(ptEle, 'hdop', accuracy);
      }
      if (typeof bearing === 'number') {
        createElement(ptEle, 'magvar', bearing); // maybe not the most suitable tag
      }
      if (message) {
        createElement(ptEle, 'cmt', accuracy);
      }
      if (typeof speed === 'number' || typeof battery === 'number' || typeof gsmSignal === 'number') {
        const extEl = createElement(ptEle, 'extensions');

        if (typeof speed === 'number') {
          const elem = document.createElementNS(FM_NS, 'speed');
          elem.textContent = speed;
          extEl.appendChild(elem);
        }

        if (typeof battery === 'number') {
          const elem = document.createElementNS(FM_NS, 'battery');
          elem.textContent = battery;
          extEl.appendChild(elem);
        }

        if (typeof gsmSignal === 'number') {
          const elem = document.createElementNS(FM_NS, 'gsm_signal');
          elem.textContent = gsmSignal;
          extEl.appendChild(elem);
        }
      }
    }
  }
}

export default gpxExportLogic;
