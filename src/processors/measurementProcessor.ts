import area from '@turf/area';
import { lineString, polygon } from '@turf/helpers';
import length from '@turf/length';
import { drawingMeasure as drawingMeasure } from 'fm3/actions/drawingPointActions';
import {
  clearMap,
  deleteFeature,
  selectFeature,
  setTool,
} from 'fm3/actions/mainActions';
import { toastsAdd } from 'fm3/actions/toastsActions';
import { httpRequest } from 'fm3/httpRequest';
import { Processor } from 'fm3/middlewares/processorMiddleware';
import { LatLon } from 'fm3/types/common';
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
    const {
      main: { selection },
      map: { zoom },
    } = getState();

    let id;

    async function measurePoint(point: LatLon) {
      let elevation;

      if (action.payload.elevation !== false) {
        dispatch(
          toastsAdd({
            messageKey: 'measurement.elevationInfo',
            messageParams: { point, elevation: null },
            timeout: 500000,
            id: 'measurementInfo',
            cancelType,
          }),
        );

        const res = await httpRequest({
          getState,
          url: `/geotools/elevation?coordinates=${point.lat},${point.lon}`,
          cancelActions: [drawingMeasure, clearMap],
        });

        elevation = assertType<[number]>(await res.json())[0];
      }

      const x = Math.floor(2 ** zoom * ((point.lon + 180) / 360));

      const y = Math.floor(
        2 ** zoom *
          ((1 - Math.asinh(Math.tan((point.lat * Math.PI) / 180.0)) / Math.PI) /
            2),
      );

      console.log({ x, y });

      dispatch(
        toastsAdd({
          id: 'measurementInfo',
          messageKey: 'measurement.elevationInfo',
          messageParams: {
            point,
            elevation,
            tile: `${zoom}/${x}/${y}`,
          },
          timeout: 500000,
          cancelType,
        }),
      );
    }

    if (action.payload.position) {
      await measurePoint(action.payload.position);

      return;
    }

    if (
      selection?.type === 'draw-line-poly' ||
      selection?.type === 'draw-points'
    ) {
      id = selection.id;

      if (id === undefined) {
        return;
      }
    } else if (selection?.type === 'line-point') {
      id = selection.lineIndex;
    } else {
      return;
    }

    if (
      selection.type === 'draw-line-poly' ||
      selection.type === 'line-point'
    ) {
      const { points, type } = getState().drawingLines.lines[id];

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
    } else if (selection?.type === 'draw-points' || action.payload.position) {
      await measurePoint(getState().drawingPoints.points[selection.id]);
    }
  },
};
