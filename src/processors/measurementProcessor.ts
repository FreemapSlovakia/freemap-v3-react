import area from '@turf/area';
import { lineString, polygon } from '@turf/helpers';
import length from '@turf/length';
import { drawingPointMeasure as drawingMeasure } from 'fm3/actions/drawingPointActions';
import {
  clearMap,
  deleteFeature,
  selectFeature,
  setTool,
} from 'fm3/actions/mainActions';
import { toastsAdd } from 'fm3/actions/toastsActions';
import { httpRequest } from 'fm3/authAxios';
import { Processor } from 'fm3/middlewares/processorMiddleware';
import { getType } from 'typesafe-actions';
import { assertType } from 'typescript-is';

const cancelType = [
  getType(clearMap),
  getType(selectFeature),
  getType(deleteFeature),
  getType(setTool),
];

export const measurementProcessor: Processor<typeof drawingMeasure> = {
  actionCreator: drawingMeasure,
  errorKey: 'measurement.elevationFetchError',
  handle: async ({ getState, dispatch, action }) => {
    const { selection } = getState().main;

    if (selection?.id === undefined) {
      return;
    }

    if (selection?.type === 'draw-line-poly') {
      const { points, type } = getState().drawingLines.lines[selection.id];

      if (type === 'polygon' && points.length > 2) {
        dispatch(
          toastsAdd({
            messageKey: 'measurement.areaInfo',
            messageParams: {
              area: area(
                polygon(
                  [
                    [...points, points[0]].map((point) => [
                      point.lon,
                      point.lat,
                    ]),
                  ],
                  {},
                ),
              ),
            },
            timeout: 500000,
            id: 'measurementInfo',
            cancelType,
          }),
        );
      } else if (type === 'line' && points.length > 1) {
        dispatch(
          toastsAdd({
            messageKey: 'measurement.distanceInfo',
            messageParams: {
              length: length(
                lineString(points.map((point) => [point.lon, point.lat])),
              ),
            },
            timeout: 500000,
            id: 'measurementInfo',
            cancelType,
          }),
        );
      }
    } else if (selection?.type === 'draw-points') {
      const point = getState().drawingPoints.points[selection.id];

      let elevation;

      if (action.payload) {
        dispatch(
          toastsAdd({
            messageKey: 'measurement.elevationInfo',
            messageParams: { point, elevation: null },
            timeout: 500000,
            id: 'measurementInfo',
            cancelType,
          }),
        );

        const { data } = await httpRequest({
          getState,
          method: 'GET',
          url: '/geotools/elevation',
          params: {
            coordinates: `${point.lat},${point.lon}`,
          },
          cancelActions: [drawingMeasure, clearMap],
        });

        elevation = assertType<[number]>(data)[0];
      }

      dispatch(
        toastsAdd({
          id: 'measurementInfo',
          messageKey: 'measurement.elevationInfo',
          messageParams: { point, elevation },
          timeout: 500000,
          cancelType,
        }),
      );
    }
  },
};
