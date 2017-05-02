import { createLogic } from 'redux-logic';
import { exportGpx, createElement } from 'fm3/gpxExporter';

export const distanceMeasurementExportGpxLogic = createLogic({
  type: 'DISTANCE_MEASUREMENT_EXPORT_GPX',
  process({ getState }, dispatch, done) {
    exportGpx('plán', (doc) => {
      const { points } = getState().distanceMeasurement;
      const rteEle = createElement(doc.documentElement, 'rte');

      if (points.length) {
        points.forEach(({ lat, lon }) => {
          createElement(rteEle, 'rtept', undefined, { lat, lon });
        });
      }
    });
    done();
  },
});

export default distanceMeasurementExportGpxLogic;
