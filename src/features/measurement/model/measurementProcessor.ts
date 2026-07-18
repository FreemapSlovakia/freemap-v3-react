import { httpRequest } from '@app/httpRequest.js';
import {
  clearMapFeatures,
  deleteFeature,
  selectFeature,
} from '@app/store/actions.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import type { RootState } from '@app/store/store.js';
import { drawingMeasure } from '@features/drawing/model/actions/drawingPointActions.js';
import type { ElevationInfoBaseProps } from '@features/elevationChart/components/ElevationInfo.js';
import { loadMeasurementMessages } from '@features/measurement/translations/loadMeasurementMessages.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { isDrawTool } from '@shared/toolDefinitions.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import type { LatLon } from '@shared/types/common.js';
import { area } from '@turf/area';
import { lineString, polygon } from '@turf/helpers';
import { length } from '@turf/length';
import z from 'zod';

// Every measurement readout pins a fixed geographic target (a drawn geometry or
// a picked point), so panning/zooming the map must not dismiss it — only a
// selection change (or clearing/deleting the feature) does.
export const cancelType = [
  clearMapFeatures.type,
  selectFeature.type,
  deleteFeature.type,
];

// The line/area readout stays visible while a drawing tool is open OR while its
// line is selected — so it shows in plain selecting mode too (e.g. after
// converting a route to a drawing, which opens no draw tool). It is dismissed
// once neither holds; selection changes are handled by cancelType.
export const measurementStale = (state: RootState) => {
  const { tools, selection } = state.main;

  return (
    !tools.some(isDrawTool) &&
    selection?.type !== 'draw-line-poly' &&
    selection?.type !== 'line-point'
  );
};

// `drawingMeasure` re-fires on every vertex add/drag of the same geometry, so
// tracking each one floods Matomo. Only report when the measured target changes.
let lastMeasureKey: string | undefined;

export const measurementProcessor: Processor<typeof drawingMeasure> = {
  actionCreator: drawingMeasure,
  handle: async ({ getState, dispatch, action, toastError }) => {
    try {
      const {
        main: { selection },
      } = getState();

      let id;

      const measureKey = action.payload.position
        ? 'position'
        : selection?.type === 'draw-line-poly' ||
            selection?.type === 'draw-points'
          ? `${selection.type}:${selection.id}`
          : selection?.type === 'line-point'
            ? `line-point:${selection.lineIndex}`
            : (selection?.type ?? 'none');

      if (measureKey !== lastMeasureKey) {
        lastMeasureKey = measureKey;

        trackMatomo(['trackEvent', 'Drawing', 'measure', selection?.type]);
      }

      // A point elevation readout is tied to its selection (or a free
      // context-menu position), not to any drawing tool, so it carries no
      // statePredicate — cancelType dismisses it when the selection changes.
      async function measurePoint(point: LatLon) {
        let elevation;

        const toastParams: ElevationInfoBaseProps = {
          point,
          elevation: null,
          loading: false,
        };

        if (action.payload.elevation !== false) {
          dispatch(
            toastsAdd({
              style: 'info',
              messageKey: 'elevationInfo',
              messageLoader: loadMeasurementMessages,
              messageParams: { ...toastParams, loading: true },
              id: 'measurementInfo',
              cancelType,
            }),
          );

          const res = await httpRequest({
            getState,
            url: `/geotools/elevation?coordinates=${point.lat},${point.lon}`,
            cancelActions: [drawingMeasure, clearMapFeatures],
          });

          elevation = z
            .array(z.number().nullable())
            .length(1)
            .parse(await res.json())[0];
        }

        dispatch(
          toastsAdd({
            id: 'measurementInfo',
            style: 'info',
            messageKey: 'elevationInfo',
            messageLoader: loadMeasurementMessages,
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
              messageKey: 'areaInfo',
              messageLoader: loadMeasurementMessages,
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
                    [...points, points[0]].map((point) => [
                      point.lon,
                      point.lat,
                    ]),
                  ),
                ),
              },
              id: 'measurementInfo',
              cancelType,
              statePredicate: measurementStale,
            }),
          );
        } else if (type === 'line' && points.length > 1) {
          dispatch(
            toastsAdd({
              style: 'info',
              messageKey: 'distanceInfo',
              messageLoader: loadMeasurementMessages,
              messageParams: {
                length: length(
                  lineString(points.map((point) => [point.lon, point.lat])),
                ),
              },
              id: 'measurementInfo',
              cancelType,
              statePredicate: measurementStale,
            }),
          );
        }
      } else if (selection?.type === 'draw-points' || action.payload.position) {
        await measurePoint(
          getState().drawingPoints.points[selection.id].coords,
        );
      }
    } catch (err) {
      await toastError(err, loadMeasurementMessages, 'elevationFetchError');
    }
  },
};
