import { getMapLeafletElement } from 'fm3/leafletElementHolder';
import { getPoiType } from 'fm3/poiTypes';

import { objectsSetResult, objectsSetFilter } from 'fm3/actions/objectsActions';
import { selectFeature, clearMap } from 'fm3/actions/mainActions';
import { Processor } from 'fm3/middlewares/processorMiddleware';
import { httpRequest } from 'fm3/authAxios';
import { assertType } from 'typescript-is';
import { OverpassResult } from 'fm3/types/common';

export const objectsFetchProcessor: Processor<typeof objectsSetFilter> = {
  actionCreator: objectsSetFilter,
  errorKey: 'objects.fetchingError',
  handle: async ({ dispatch, getState, action }) => {
    const le = getMapLeafletElement();

    if (!le) {
      return;
    }

    const b = le.getBounds();

    const poiType = getPoiType(action.payload);

    if (!poiType) {
      throw new Error(`unexpected POI type number: ${action.payload}`);
    }

    const query = `[out:json][timeout:60]; ${poiType.overpassFilter.replace(
      /\{\{bbox\}\}/g,
      `${b.getSouth()},${b.getWest()},${b.getNorth()},${b.getEast()}`,
    )}; out center;`;

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
      typeId: action.payload,
    }));

    dispatch(objectsSetResult(result));
  },
};
