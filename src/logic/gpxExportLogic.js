import { createLogic } from 'redux-logic';
import { exportGpx, createElement } from 'fm3/gpxExporter';

export const gpxExportLogic = createLogic({
  type: 'EXPORT_GPX',
  process({ getState }, dispatch, done) {
    exportGpx('export', (doc) => {
      const { distanceMeasurement, areaMeasurement, elevationMeasurement, infoPoint, objects, routePlanner } = getState();

      addADMeasurement(doc, distanceMeasurement);
      addADMeasurement(doc, areaMeasurement); // TODO add info about area
      addElevationMeasurement(doc, elevationMeasurement);
      addInfoPoint(doc, infoPoint);
      addObjects(doc, objects);
      addPlannedRoute(doc, routePlanner);

      done();
    });
  },
});

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

function addInfoPoint(doc, { lat, lon, label }) {
  if (lat && lon) {
    const wptEle = createElement(doc.documentElement, 'wpt', undefined, { lat, lon });
    if (label) {
      createElement(wptEle, 'name', label);
    }
  }
}

function addObjects(doc, { objects }) {
  objects.forEach(({ lat, lon, tags }) => {
    const wptEle = createElement(doc.documentElement, 'wpt', undefined, { lat, lon });

    if (!isNaN(tags.ele)) {
      createElement(wptEle, 'ele', tags.ele);
    }

    if (tags.name) {
      createElement(wptEle, 'name', tags.name);
    }
  });
}

function addPlannedRoute(doc, { shapePoints }) {
  if (shapePoints) {
    const rteEle = createElement(doc.documentElement, 'rte');

    shapePoints.forEach(([lat, lon]) => {
      createElement(rteEle, 'rtept', undefined, { lat, lon });
    });

    // TODO add start / finish / midpoints / itinerar details (?) / metadata
  }
}

export default gpxExportLogic;
