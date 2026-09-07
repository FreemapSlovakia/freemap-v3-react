import { clearMapFeatures, selectFeature } from '@app/store/actions.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { mapPromise } from '@features/map/hooks/leafletElementHolder.js';
import { mapRefocus } from '@features/map/model/actions.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import { fetchObjects } from '../objectsQuery.js';
import { loadObjectsMessages } from '../translations/loadObjectsMessages.js';
import { objectsSetFilter, objectsSetResult } from './actions.js';

/**
 * As many as the viewport can hold without turning into a wall of markers.
 * Read per fetch, since the window can be resized; capped because each marker
 * is its own React root, so a huge display would pay for it on every pan.
 */
function objectLimit() {
  return Math.min(
    Math.max(
      Math.round((window.innerHeight * window.innerWidth) / 2500 / 10) * 10,
      // A viewport small enough to round to zero is still a viewport.
      10,
    ),
    1200,
  );
}

const minZoom = 8;

export const objectsChangePredicateProcessor: Processor = {
  actionCreator: objectsSetFilter,
  stateChangePredicate: (state) => state.objects.active.join('\n'),
  handle: ({ getState }) => {
    trackMatomo([
      'trackEvent',
      'Objects',
      'search',
      [...getState().objects.active].sort().join(','),
    ]);
  },
};

export const objectsFetchProcessor: Processor = {
  stateChangePredicate: (state) =>
    [
      state.map.lat,
      state.map.lon,
      state.map.zoom,
      ...state.objects.active,
    ].join('\n'),
  handle: async ({ dispatch, getState, toastError }) => {
    try {
      const active = getState().objects.active;

      if (active.length === 0) {
        if (getState().objects.objects.length > 0) {
          dispatch(objectsSetResult([]));
        }

        return;
      }

      if (getState().map.zoom < minZoom) {
        const om = await loadObjectsMessages(getState().l10n.language);

        setTimeout(() => {
          dispatch(
            toastsAdd({
              id: 'objects.lowZoomAlert',
              messageKey: 'lowZoomAlert.message',
              messageParams: { minZoom },
              messageLoader: loadObjectsMessages,
              style: 'warning',
              actions: [
                {
                  name: om.lowZoomAlert.zoom,
                  action: [mapRefocus({ zoom: minZoom })],
                },
              ],
              cancelType: [
                clearMapFeatures.type,
                mapRefocus.type,
                objectsSetFilter.type,
              ],
            }),
          );
        });

        dispatch(objectsSetResult([]));

        return;
      }

      const b = (await mapPromise).getBounds();

      const limit = objectLimit();

      const { objects, truncated } = await fetchObjects(
        {
          active,
          bounds: {
            south: b.getSouth(),
            west: b.getWest(),
            north: b.getNorth(),
            east: b.getEast(),
          },
          limit,
        },
        {
          getState,
          cancelActions: [
            objectsSetFilter,
            clearMapFeatures,
            selectFeature,
            mapRefocus,
          ],
        },
      );

      if (truncated) {
        dispatch(
          toastsAdd({
            id: 'objects.tooManyPoints',
            messageKey: 'tooManyPoints',
            messageParams: { limit },
            messageLoader: loadObjectsMessages,
            style: 'warning',
            cancelType: [
              clearMapFeatures.type,
              mapRefocus.type,
              objectsSetFilter.type,
            ],
          }),
        );
      }

      dispatch(objectsSetResult(objects));
    } catch (err) {
      // Coalesce the storm of identical failures while panning into one toast.
      await toastError(err, loadObjectsMessages, 'fetchingError', 'objects');
    }
  },
};
