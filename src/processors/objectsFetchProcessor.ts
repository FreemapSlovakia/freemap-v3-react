import { clearMap, selectFeature } from 'fm3/actions/mainActions';
import { objectsSetFilter, objectsSetResult } from 'fm3/actions/objectsActions';
import { httpRequest } from 'fm3/authAxios';
import { mapPromise } from 'fm3/leafletElementHolder';
import { Processor } from 'fm3/middlewares/processorMiddleware';
import { OverpassResult } from 'fm3/types/common';
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

    const b = (await mapPromise).getBounds();
    const bb = `(${b.getSouth()},${b.getWest()},${b.getNorth()},${b.getEast()})`;

    const query =
      '[out:json][timeout:60]; (' +
      ents
        .map(
          (ent) =>
            'nwr' +
            ent.map(([key, value]) => `["${key}"="${value}"]${bb}`) +
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
