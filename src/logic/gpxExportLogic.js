import { createLogic } from 'redux-logic';
import { exportGpx, createElement } from 'fm3/gpxExporter';

export const gpxExportLogic = createLogic({
  type: 'EXPORT_GPX',
  process({ getState }, dispatch, done) {
    exportGpx('export', (doc) => {
      // distance measurement
      const { points } = getState().distanceMeasurement;
      const rteEle = createElement(doc.documentElement, 'rte');

      if (points.length) {
        points.forEach(({ lat, lon }) => {
          createElement(rteEle, 'rtept', undefined, { lat, lon });
        });
      }

      // objects
      getState().objects.objects.forEach(({ lat, lon, tags }) => {
        const wptEle = createElement(doc.documentElement, 'wpt', undefined, { lat, lon });

        if (!isNaN(tags.ele)) {
          createElement(wptEle, 'ele', tags.ele);
        }

        if (tags.name) {
          createElement(wptEle, 'name', tags.name);
        }
      });

      // planned route
      const { shapePoints } = getState().routePlanner;
      if (shapePoints) {
        const rteEle2 = createElement(doc.documentElement, 'rte');

        shapePoints.forEach(([lat, lon]) => {
          createElement(rteEle2, 'rtept', undefined, { lat, lon });
        });

        // TODO add start / finish / midpoints / itinerar details (?) / metadata
      }
    });
    done();
  },
});

export default gpxExportLogic;
