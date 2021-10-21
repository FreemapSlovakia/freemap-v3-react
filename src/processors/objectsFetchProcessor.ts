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
      return;
    }

    if (getState().map.zoom < 10) {
      setTimeout(() => {
        dispatch(
          toastsAdd({
            id: 'objects.lowZoomAlert',
            messageKey: 'objects.lowZoomAlert.message',
            style: 'warning',
            actions: [
              {
                nameKey: 'objects.lowZoomAlert.zoom',
                action: [mapRefocus({ zoom: 10 })],
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
      `); out center 500;`;

    // TODO warn if num of results is 500

    const { data } = await httpRequest({
      getState,
      method: 'POST',
      url: 'https://overpass.freemap.sk/api/interpreter',
      data: `data=${encodeURIComponent(query)}`,
      expectedStatus: 200,
      cancelActions: [objectsSetFilter, clearMap, selectFeature],
    });

    const result = assertType<OverpassResult>(data).elements.map((e) => ({
      id: e.id,
      lat: e.type === 'node' ? e.lat : e.center.lat,
      lon: e.type === 'node' ? e.lon : e.center.lon,
      tags: e.tags,
      type: e.type,
    }));

    dispatch(objectsSetResult(result));
  },
};
