import { clearMapFeatures, selectFeature } from '@app/store/actions.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import type { RootState } from '@app/store/store.js';
import { mapPromise } from '@features/map/hooks/leafletElementHolder.js';
import { mapRefocus } from '@features/map/model/actions.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import { featureIdsEqual } from '@shared/types/featureId.js';
import { fetchObjects } from '../objectsQuery.js';
import { loadObjectsMessages } from '../translations/loadObjectsMessages.js';
import {
  type ObjectsResult,
  objectsSetFilter,
  objectsSetResult,
} from './actions.js';

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

/** A fresh result, still holding the selected object wherever it fell out. */
function keepSelected(
  state: RootState,
  objects: ObjectsResult[],
): ObjectsResult[] {
  const { selection } = state.main;

  if (
    selection?.type !== 'objects' ||
    objects.some((o) => featureIdsEqual(o.id, selection.id))
  ) {
    return objects;
  }

  const selected = state.objects.objects.find((o) =>
    featureIdsEqual(o.id, selection.id),
  );

  return selected ? [...objects, selected] : objects;
}

/**
 * Lets go of an object kept only for being selected, once it no longer is and
 * no search would show it: off the view, or below the zoom objects need.
 */
export const objectsReleaseProcessor: Processor = {
  stateChangePredicate: (state) => state.main.selection,
  handle: async ({ dispatch, getState, prevState }) => {
    const prev = prevState.main.selection;

    if (prev?.type !== 'objects') {
      return;
    }

    const state = getState();

    const { selection } = state.main;

    if (
      selection?.type === 'objects' &&
      featureIdsEqual(selection.id, prev.id)
    ) {
      return;
    }

    const object = state.objects.objects.find((o) =>
      featureIdsEqual(o.id, prev.id),
    );

    if (!object) {
      return;
    }

    const map = await mapPromise;

    if (
      state.map.zoom >= minZoom &&
      map.getBounds().contains([object.coords.lat, object.coords.lon])
    ) {
      return;
    }

    dispatch(
      objectsSetResult(getState().objects.objects.filter((o) => o !== object)),
    );
  },
};

export const objectsChangePredicateProcessor: Processor = {
  actionCreator: objectsSetFilter,
  stateChangePredicate: (state) => state.objects.active.join('\n'),
  handle: ({ getState }) => {
    trackMatomo([
      'trackEvent',
      'Objects',
      'search',
      getState().objects.active.toSorted().join(','),
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
  handle: async ({ dispatch, getState, prevState, toastError }) => {
    // Only moving the map keeps the selected object: a filter that no longer
    // asks for it lets it go.
    const moved =
      prevState.objects.active.join('\n') ===
      getState().objects.active.join('\n');

    const keep = (objects: ObjectsResult[]) =>
      moved ? keepSelected(getState(), objects) : objects;

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

        dispatch(objectsSetResult(keep([])));

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

      dispatch(objectsSetResult(keep(objects)));
    } catch (err) {
      // Coalesce the storm of identical failures while panning into one toast.
      await toastError(err, loadObjectsMessages, 'fetchingError', 'objects');
    }
  },
};
