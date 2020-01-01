import { Processor } from 'fm3/middlewares/processorMiddleware';
import { httpRequest } from 'fm3/authAxios';
import { clearMap, selectFeature } from 'fm3/actions/mainActions';
import { assertType } from 'typescript-is';
import { drawingPointMeasure } from 'fm3/actions/drawingPointActions';
import { toastsAdd } from 'fm3/actions/toastsActions';
import { getType } from 'typesafe-actions';
import area from '@turf/area';
import length from '@turf/length';
import { polygon, lineString } from '@turf/helpers';

export const elevationMeasurementProcessor: Processor = {
  actionCreator: drawingPointMeasure,
  errorKey: 'measurement.elevationFetchError',
  handle: async ({ getState, dispatch }) => {
    const { selection } = getState().main;

    if (selection?.id === undefined) {
      return;
    }

    const { id } = selection;

    if (selection?.type === 'draw-polygons') {
      const { points } = getState().drawingLines.lines[id];

      dispatch(
        toastsAdd({
          messageKey: 'measurement.areaInfo',
          messageParams: {
            area: area(
              polygon(
                [[...points, points[0]].map(point => [point.lon, point.lat])],
                {},
              ),
            ),
          },
          timeout: 5000,
          collapseKey: 'measurementInfo',
          cancelType: getType(selectFeature),
        }),
      );
    } else if (selection?.type === 'draw-lines') {
      const { points } = getState().drawingLines.lines[id];

      dispatch(
        toastsAdd({
          messageKey: 'measurement.distanceInfo',
          messageParams: {
            length: length(
              lineString(points.map(point => [point.lon, point.lat])),
            ),
          },
          timeout: 5000,
          collapseKey: 'measurementInfo',
          cancelType: getType(selectFeature),
        }),
      );
    } else if (selection?.type === 'draw-points') {
      const point = getState().drawingPoints.points[id];

      const { data } = await httpRequest({
        getState,
        method: 'GET',
        url: '/geotools/elevation',
        params: {
          coordinates: `${point.lat},${point.lon}`,
        },
        cancelActions: [drawingPointMeasure, clearMap],
      });

      const [elevation] = assertType<[number]>(data);

      dispatch(
        toastsAdd({
          messageKey: 'measurement.elevationInfo',
          messageParams: { point, elevation },
          timeout: 5000,
          collapseKey: 'measurementInfo',
          cancelType: getType(selectFeature),
        }),
      );
    }
  },
};
