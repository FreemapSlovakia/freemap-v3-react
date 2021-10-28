import { clearMap, selectFeature } from 'fm3/actions/mainActions';
import { mapRefocus } from 'fm3/actions/mapActions';
import { objectsSetFilter, objectsSetResult } from 'fm3/actions/objectsActions';
import { toastsAdd } from 'fm3/actions/toastsActions';
import { httpRequest } from 'fm3/authAxios';
import { mapPromise } from 'fm3/leafletElementHolder';
import { Processor } from 'fm3/middlewares/processorMiddleware';
import { OverpassResult } from 'fm3/types/common';
import { getType } from 'typesafe-actions';
import { assertType } from 'typescript-is';

const limit = 1000;

const minZoom = 10;

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
              getType(clearMap),
              getType(mapRefocus),
              getType(objectsSetFilter),
            ],
          }),
        );
      });

      dispatch(objectsSetResult([]));

      return;
    }

    const b = (await mapPromise).getBounds();
    const bb = `(${b.getSouth()},${b.getWest()},${b.getNorth()},${b.getEast()})`;

    const query =
      '[out:json][timeout:60]; (' +
      ents
        .map(
          (ent) =>
            'nwr' +
            ent.map(([key, value]) => `["${key}"="${value}"]`).join('') +
            bb +
            ';',
        )
        .join('') +
      `); out center ${limit};`;

    const { data } = await httpRequest({
      getState,
      method: 'POST',
      url: 'https://overpass.freemap.sk/api/interpreter',
      data: `data=${encodeURIComponent(query)}`,
      expectedStatus: 200,
      cancelActions: [objectsSetFilter, clearMap, selectFeature, mapRefocus],
    });

    const result = assertType<OverpassResult>(data).elements.map((e) => ({
      id: e.id,
      lat: e.type === 'node' ? e.lat : e.center.lat,
      lon: e.type === 'node' ? e.lon : e.center.lon,
      tags: e.tags,
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
            getType(clearMap),
            getType(mapRefocus),
            getType(objectsSetFilter),
          ],
        }),
      );
    }

    dispatch(objectsSetResult(result));
  },
};
