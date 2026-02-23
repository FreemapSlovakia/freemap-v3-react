import {
  clearMapFeatures,
  deleteFeature,
  selectFeature,
  setTool,
} from '@app/store/actions.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import type { ElevationInfoBaseProps } from '@features/elevationChart/components/ElevationInfo.js';
import { mapRefocus } from '@features/map/model/actions.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import type { LatLon } from '@shared/types/common.js';
import { area } from '@turf/area';
import { lineString, polygon } from '@turf/helpers';
import { length } from '@turf/length';
import { assert } from 'typia';
import { httpRequest } from '../../../app/httpRequest.js';
import { drawingMeasure } from './actions/drawingPointActions.js';

const cancelType = [
  clearMapFeatures.type,
  selectFeature.type,
  deleteFeature.type,
  setTool.type,
  mapRefocus.type,
];

export const measurementProcessor: Processor<typeof drawingMeasure> = {
  actionCreator: drawingMeasure,
  errorKey: 'measurement.elevationFetchError',
  handle: async ({ getState, dispatch, action }) => {
    const {
      main: { selection },
    } = getState();

    let id;

    window._paq.push(['trackEvent', 'Drawing', 'measure', selection?.type]);

    async function measurePoint(point: LatLon) {
      let elevation;

      const toastParams: ElevationInfoBaseProps = {
        point,
        elevation: null,
      };

      if (action.payload.elevation !== false) {
        dispatch(
          toastsAdd({
            style: 'info',
            messageKey: 'measurement.elevationInfo',
            messageParams: toastParams,
            id: 'measurementInfo',
            cancelType,
          }),
        );

        const res = await httpRequest({
          getState,
          url: `/geotools/elevation?coordinates=${point.lat},${point.lon}`,
          cancelActions: [drawingMeasure, clearMapFeatures],
        });

        elevation = assert<[number]>(await res.json())[0];
      }

      dispatch(
        toastsAdd({
          id: 'measurementInfo',
          style: 'info',
          messageKey: 'measurement.elevationInfo',
          messageParams: {
            ...toastParams,
            elevation,
          },
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
            style: 'info',
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
              perimeter: length(
                lineString(
                  [...points, points[0]].map((point) => [point.lon, point.lat]),
                ),
              ),
            },
            id: 'measurementInfo',
            cancelType,
          }),
        );
      } else if (type === 'line' && points.length > 1) {
        dispatch(
          toastsAdd({
            style: 'info',
            messageKey: 'measurement.distanceInfo',
            messageParams: {
              length: length(
                lineString(points.map((point) => [point.lon, point.lat])),
              ),
            },
            id: 'measurementInfo',
            cancelType,
          }),
        );
      }
    } else if (selection?.type === 'draw-points' || action.payload.position) {
      await measurePoint(getState().drawingPoints.points[selection.id].coords);
    }
  },
};
