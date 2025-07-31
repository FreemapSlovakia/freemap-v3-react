import { assert } from 'typia';
import { clearMapFeatures, selectFeature } from '../actions/mainActions.js';
import { mapRefocus } from '../actions/mapActions.js';
import {
  objectsSetFilter,
  objectsSetResult,
} from '../actions/objectsActions.js';
import { toastsAdd } from '../actions/toastsActions.js';
import { httpRequest } from '../httpRequest.js';
import { mapPromise } from '../leafletElementHolder.js';
import type { Processor } from '../middlewares/processorMiddleware.js';
import type { OverpassResult } from '../types/overpass.js';

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
      getState().objects.active.join('|'),
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
  errorKey: 'objects.fetchingError',
  handle: async ({ dispatch, getState }) => {
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
      setTimeout(() => {
        dispatch(
          toastsAdd({
            id: 'objects.lowZoomAlert',
            messageKey: 'objects.lowZoomAlert.message',
            messageParams: { minZoom },
            style: 'warning',
            actions: [
              {
                nameKey: 'objects.lowZoomAlert.zoom',
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
                    ? `["${key}"="${value}"]`
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

    const result = assert<OverpassResult>(await res.json())
      .elements.filter((e) => e.tags)
      .map((e) => ({
        id: e.id,
        lat: e.type === 'node' ? e.lat : e.center.lat,
        lon: e.type === 'node' ? e.lon : e.center.lon,
        tags: e.tags ?? {},
        type: e.type,
      }));

    if (result.length >= limit) {
      dispatch(
        toastsAdd({
          id: 'objects.tooManyPoints',
          messageKey: 'objects.tooManyPoints',
          messageParams: {
            limit,
          },
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
  },
};
