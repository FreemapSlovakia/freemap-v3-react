import axios from 'axios';
import { createLogic } from 'redux-logic';
import FileSaver from 'file-saver';
import qs from 'query-string';

import * as at from 'fm3/actionTypes';
import { createElement, addAttribute, GPX_NS } from 'fm3/gpxExporter';
import { startProgress, stopProgress } from 'fm3/actions/mainActions';
import { toastsAddError } from 'fm3/actions/toastsActions';
import { getMapLeafletElement } from 'fm3/leafletElementHolder';

export const gpxExportLogic = createLogic({
  type: at.EXPORT_GPX,
  process({ getState, action, cancelled$, storeDispatch }, dispatch, done) {
    const doc = document.implementation.createDocument(GPX_NS, 'gpx');

    addAttribute(doc.documentElement, 'version', '1.1');
    addAttribute(doc.documentElement, 'creator', 'https://www.freemap.sk/');

    const meta = createElement(doc.documentElement, 'metadata');
    const copyright = createElement(meta, 'copyright', undefined, { author: 'OpenStreetMap contributors' });
    createElement(copyright, 'license', 'http://www.openstreetmap.org/copyright');
    createElement(meta, 'desc', 'Export from https://www.freemap.sk/');
    const author = createElement(meta, 'author');
    createElement(author, 'name', 'Freemap Slovakia');
    createElement(author, 'email', 'freemap@freemap.sk');
    const link = createElement(author, 'link', undefined, { href: 'https://www.freemap.sk/' });
    createElement(link, 'text', 'Freemap Slovakia');
    createElement(link, 'type', 'text/html');
    createElement(meta, 'time', new Date().toISOString());
    createElement(meta, 'keywords', action.payload.join(' '));

    const { distanceMeasurement, areaMeasurement, elevationMeasurement, infoPoint, objects, routePlanner } = getState();

    const set = new Set(action.payload);

    const promises = [];

    const pid = Math.random();
    dispatch(startProgress(pid));

    if (set.has('pictures')) {
      const source = axios.CancelToken.source();
      cancelled$.subscribe(() => {
        source.cancel();
      });

      const {
        tag, userId, ratingFrom, ratingTo, takenAtFrom, takenAtTo, createdAtFrom, createdAtTo,
      } = getState().gallery.filter;

      const b = getMapLeafletElement().getBounds();

      const p = axios.get(`${process.env.API_URL}/gallery/pictures`, {
        params: {
          by: 'bbox',
          bbox: `${b.getWest()},${b.getSouth()},${b.getEast()},${b.getNorth()}`,
          tag,
          userId,
          ratingFrom,
          ratingTo,
          takenAtFrom: takenAtFrom && takenAtFrom.toISOString(),
          takenAtTo: takenAtTo && takenAtTo.toISOString(),
          createdAtFrom: createdAtFrom && createdAtFrom.toISOString(),
          createdAtTo: createdAtTo && createdAtTo.toISOString(),
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

    Promise.all(promises)
      .then(() => {
        storeDispatch(stopProgress(pid));
        const serializer = new XMLSerializer();

        // eslint-disable-next-line
        //console.log(serializer.serializeToString(doc));

        FileSaver.saveAs(new Blob([serializer.serializeToString(doc)], { type: 'application/json' }), 'export.gpx');
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
  const rteEle = createElement(doc.documentElement, 'rte');

  if (points.length) {
    points.forEach(({ lat, lon }) => {
      createElement(rteEle, 'rtept', undefined, { lat, lon });
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
    const rteEle = createElement(doc.documentElement, 'rte');
    createElement(rteEle, 'name', `Alternatíva ${i + 1}`);

    itinerary.forEach(({ shapePoints }) => {
      shapePoints.forEach(([lat, lon]) => {
        createElement(rteEle, 'rtept', undefined, { lat, lon });
      });
    });
  });
}

export default gpxExportLogic;
