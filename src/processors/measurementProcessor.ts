import area from '@turf/area';
import { lineString, polygon } from '@turf/helpers';
import length from '@turf/length';
import { assert } from 'typia';
import { drawingMeasure } from '../actions/drawingPointActions.js';
import {
  clearMapFeatures,
  deleteFeature,
  selectFeature,
  setTool,
} from '../actions/mainActions.js';
import { mapRefocus } from '../actions/mapActions.js';
import { toastsAdd } from '../actions/toastsActions.js';
import { ElevationInfoBaseProps } from '../components/ElevationInfo.js';
import { httpRequest } from '../httpRequest.js';
import { Processor } from '../middlewares/processorMiddleware.js';
import { LatLon } from '../types/common.js';

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
            messageKey: 'measurement.elevationInfo',
            messageParams: toastParams,
            timeout: 500000,
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
          messageKey: 'measurement.elevationInfo',
          messageParams: {
            ...toastParams,
            elevation,
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
