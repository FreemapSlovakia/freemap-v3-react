import { httpRequest } from '@app/httpRequest.js';
import { clearMapFeatures, selectFeature } from '@app/store/actions.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { mapPromise } from '@features/map/hooks/leafletElementHolder.js';
import { mapRefocus } from '@features/map/model/actions.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import {
  OverpassCenterExtraSchema,
  overpassResultSchema,
} from '@shared/types/overpass.js';
import { loadObjectsMessages } from '../translations/loadObjectsMessages.js';
import {
  type ObjectsResult,
  objectsSetFilter,
  objectsSetResult,
} from './actions.js';

const OverpassResultCenterSchema = overpassResultSchema(
  OverpassCenterExtraSchema,
);

const limit =
  Math.round((window.screen.height * window.screen.width) / 5000 / 10) * 10;

const minZoom = 10;

export const objectsChangePredicateProcessor: Processor = {
  actionCreator: objectsSetFilter,
  stateChangePredicate: (state) => state.objects.active.join('\n'),
  handle: ({ getState }) => {
    window._paq.push([
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
      const ents = getState().objects.active.map((tags) =>
        tags.split(',').map((item) => item.split('=')),
      );

      if (ents.length === 0) {
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

      const query =
        '[out:json][timeout:15]; (' +
        ents
          .map(
            (ent) =>
              'nwr' +
              ent
                .map(([key, value]) =>
                  key.startsWith('!')
                    ? `[!"${key.slice(1)}"]`
                    : value
                      ? `["${key}"~"(^|;\\s*)${value}(\\s*;|$)",i]`
                      : `["${key}"]`,
                )
                .join('') +
              `(${b.getSouth()},${b.getWest()},${b.getNorth()},${b.getEast()})` +
              ';',
          )
          .join('') +
        `); out center ${limit};`;

      const res = await httpRequest({
        getState,
        method: 'POST',
        url: 'https://overpass.freemap.sk/api/interpreter',
        // url: 'https://overpass-api.de/api/interpreter',
        body: `data=${encodeURIComponent(query)}`,
        expectedStatus: 200,
        cancelActions: [
          objectsSetFilter,
          clearMapFeatures,
          selectFeature,
          mapRefocus,
        ],
      });

      const result = OverpassResultCenterSchema.parse(await res.json())
        .elements.filter((e) => e.tags)
        .map(
          (e) =>
            ({
              id: { type: 'osm', elementType: e.type, id: e.id },
              coords:
                e.type === 'node'
                  ? { lat: e.lat, lon: e.lon }
                  : {
                      lat: e.center.lat,
                      lon: e.center.lon,
                    },
              tags: e.tags ?? {},
            }) satisfies ObjectsResult,
        );

      if (result.length >= limit) {
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

      dispatch(objectsSetResult(result));
    } catch (err) {
      // Coalesce the storm of identical failures while panning into one toast.
      await toastError(err, loadObjectsMessages, 'fetchingError', 'objects');
    }
  },
};
