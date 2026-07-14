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
import { mapRefocus } from '@features/map/model/actions.js';
import { loadMeasurementMessages } from '@features/measurement/translations/loadMeasurementMessages.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { isDrawTool } from '@shared/toolDefinitions.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import type { LatLon } from '@shared/types/common.js';
import { area } from '@turf/area';
import { lineString, polygon } from '@turf/helpers';
import { length } from '@turf/length';
import z from 'zod';

const cancelType = [
  clearMapFeatures.type,
  selectFeature.type,
  deleteFeature.type,
  mapRefocus.type,
];

// A point measurement pins a fixed geographic location, so panning/zooming the
// map (mapRefocus) must not dismiss its readout — only a selection change does.
const pointCancelType = [
  clearMapFeatures.type,
  selectFeature.type,
  deleteFeature.type,
];

// Dismiss the measurement readouts when no drawing tool is open anymore — not
// merely when some other tool opens (the draw tool stays open then).
const drawingClosed = (state: RootState) => !state.main.tools.some(isDrawTool);

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

      // The context-menu path measures a free position with no drawing tool
      // open, so the drawingClosed predicate must not apply there — otherwise it
      // dismisses the readout (and cancels the fetch) immediately.
      async function measurePoint(point: LatLon, tiedToDrawing: boolean) {
        const statePredicate = tiedToDrawing ? drawingClosed : undefined;

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
              cancelType: pointCancelType,
              statePredicate,
            }),
          );

          const res = await httpRequest({
            getState,
            url: `/geotools/elevation?coordinates=${point.lat},${point.lon}`,
            cancelActions: [drawingMeasure, clearMapFeatures],
            statePredicate,
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
            cancelType: pointCancelType,
            statePredicate,
          }),
        );
      }

      if (action.payload.position) {
        await measurePoint(action.payload.position, false);

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
              statePredicate: drawingClosed,
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
              statePredicate: drawingClosed,
            }),
          );
        }
      } else if (selection?.type === 'draw-points' || action.payload.position) {
        // A selected point's elevation readout is tied to the selection, not to
        // any drawing tool — it stays visible in plain selecting mode too, and
        // is dismissed via cancelType when the selection changes or clears.
        await measurePoint(
          getState().drawingPoints.points[selection.id].coords,
          false,
        );
      }
    } catch (err) {
      await toastError(err, loadMeasurementMessages, 'elevationFetchError');
    }
  },
};
