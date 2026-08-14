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
import { fetchElevations } from '@shared/elevation.js';
import { isAbortError } from '@shared/isAbortError.js';
import { isDrawTool } from '@shared/toolDefinitions.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import type { LatLon } from '@shared/types/common.js';
import { area } from '@turf/area';
import { lineString, polygon } from '@turf/helpers';
import { length } from '@turf/length';

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
  const { mapTool, selection } = state.main;

  return (
    !isDrawTool(mapTool) &&
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

        const sources = new Set<string>();

        const toastParams: ElevationInfoBaseProps = {
          point,
          elevation: null,
          loading: false,
          sources: [],
        };

        let error: unknown;

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

          try {
            // Through the shared fetch, so a single point is read the same way a
            // profile is — and the readout's tooltip credits the model that
            // actually answered.
            [elevation] = await fetchElevations(
              [[point.lat, point.lon]],
              getState,
              [drawingMeasure, clearMapFeatures],
              sources,
            );
          } catch (err) {
            // The coordinates and the tile links stand without an elevation, so
            // the failure is answered in the readout's own line rather than
            // thrown at a danger toast beside a spinner that never stops.
            if (isAbortError(err)) {
              throw err;
            }

            error = err;
          }
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
              error,
              sources: [...sources],
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
        const { lines } = getState().drawingLines;

        const line = lines[id];

        const { points, type } = line;

        if (type === 'polygon' && points.length > 2) {
          // The holes belong to the shape, so they come off its area and their
          // outlines count towards its perimeter. A hole measured on its own is
          // just its own ring.
          const rings = [
            points,
            ...(line.holeOfId === undefined
              ? lines
                  .filter((l) => l.holeOfId === line.id && l.points.length > 2)
                  .map((l) => l.points)
              : []),
          ].map((ring) =>
            [...ring, ring[0]!].map((point) => [point.lon, point.lat]),
          );

          dispatch(
            toastsAdd({
              style: 'info',
              messageKey: 'areaInfo',
              messageLoader: loadMeasurementMessages,
              messageParams: {
                area: area(polygon(rings, {})),
                perimeter: rings.reduce(
                  (sum, ring) => sum + length(lineString(ring)),
                  0,
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
