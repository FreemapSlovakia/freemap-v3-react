import {
  clearMapFeatures,
  deleteFeature,
  selectFeature,
} from '@app/store/actions.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import type { RootState } from '@app/store/store.js';
import { isCompleteFeature } from '@features/dataViewer/vertexEditing.js';
import { ringsArea, ringsPerimeter } from '@features/drawing/measureLine.js';
import { drawingMeasure } from '@features/drawing/model/actions/drawingPointActions.js';
import type { ElevationInfoBaseProps } from '@features/elevationChart/components/ElevationInfo.js';
import { loadMeasurementMessages } from '@features/measurement/translations/loadMeasurementMessages.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import {
  creditedAttributions,
  fetchElevations,
  newElevationCredits,
} from '@shared/elevation.js';
import { isAbortError } from '@shared/isAbortError.js';
import { isDrawTool } from '@shared/toolDefinitions.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import type { LatLon } from '@shared/types/common.js';
import { length as turfLength } from '@turf/length';

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
    selection?.type !== 'feature' &&
    selection?.type !== 'vertex'
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

      const measureKey = action.payload.position
        ? 'position'
        : selection?.type === 'feature' || selection?.type === 'vertex'
          ? `feature:${selection.id}`
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

        const credits = newElevationCredits();

        const toastParams: ElevationInfoBaseProps = {
          point,
          elevation: null,
          loading: false,
          sources: [],
          attributions: [],
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
              credits,
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

          // A selection change takes this toast with it (`cancelType`) without
          // touching the read, which outlives it. Re-adding it then would put
          // the point just left — its coordinates, its tile links — beside
          // whatever is selected now, where nothing is about to replace it.
          if (!getState().toasts.toasts['measurementInfo']) {
            return;
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
              sources: [...credits.sources],
              attributions: creditedAttributions(credits),
            },
            cancelType,
          }),
        );
      }

      if (action.payload.position) {
        await measurePoint(action.payload.position);

        return;
      }

      if (selection?.type !== 'feature' && selection?.type !== 'vertex') {
        return;
      }

      const feature =
        getState().trackViewer.trackGeojson?.features[selection.id];

      const geometry = feature?.geometry;

      if (geometry?.type === 'Point') {
        const [lon, lat] = geometry.coordinates;

        await measurePoint({ lat: lat!, lon: lon! });
      } else if (geometry?.type === 'Polygon' && isCompleteFeature(feature!)) {
        const rings = geometry.coordinates.filter((ring) => ring.length > 3);

        dispatch(
          toastsAdd({
            style: 'info',
            messageKey: 'areaInfo',
            messageLoader: loadMeasurementMessages,
            messageParams: {
              area: ringsArea(rings),
              perimeter: ringsPerimeter(rings) / 1000,
            },
            id: 'measurementInfo',
            cancelType,
            statePredicate: measurementStale,
          }),
        );
      } else if (
        (geometry?.type === 'LineString' ||
          geometry?.type === 'MultiLineString') &&
        isCompleteFeature(feature!)
      ) {
        dispatch(
          toastsAdd({
            style: 'info',
            messageKey: 'distanceInfo',
            messageLoader: loadMeasurementMessages,
            messageParams: {
              length: turfLength(feature!, { units: 'kilometers' }),
            },
            id: 'measurementInfo',
            cancelType,
            statePredicate: measurementStale,
          }),
        );
      }
    } catch (err) {
      await toastError(err, loadMeasurementMessages, 'elevationFetchError');
    }
  },
};
