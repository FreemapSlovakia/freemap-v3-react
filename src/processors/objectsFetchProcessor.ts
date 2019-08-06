import { getMapLeafletElement } from 'fm3/leafletElementHolder';
import { getPoiType } from 'fm3/poiTypes';

import { objectsSetResult, objectsSetFilter } from 'fm3/actions/objectsActions';
import { setTool, clearMap } from 'fm3/actions/mainActions';
import { IProcessor } from 'fm3/middlewares/processorMiddleware';
import { httpRequest } from 'fm3/authAxios';
import { dispatchAxiosErrorAsToast } from './utils';

export const objectsFetchProcessor: IProcessor<typeof objectsSetFilter> = {
  actionCreator: objectsSetFilter,
  handle: async ({ dispatch, getState, action }) => {
    const le = getMapLeafletElement();
    if (!le) {
      return;
    }

    const b = le.getBounds();
    const bbox = `${b.getSouth()},${b.getWest()},${b.getNorth()},${b.getEast()}`;

    const poiType = getPoiType(action.payload);
    if (!poiType) {
      throw new Error(`unexpected POI type number: ${action.payload}`);
    }

    const query = `[out:json][timeout:60]; ${poiType.overpassFilter.replace(
      /\{\{bbox\}\}/g,
      bbox,
    )}; out center;`;

    try {
      const { data } = await httpRequest({
        getState, // TODO no auth!
        method: 'POST',
        url: '//overpass-api.de/api/interpreter',
        data: `data=${encodeURIComponent(query)}`,
        expectedStatus: 200,
        cancelActions: [objectsSetFilter, clearMap, setTool],
      });

      const result = data.elements.map(({ id, center, tags, lat, lon }) => ({
        id,
        lat: (center && center.lat) || lat,
        lon: (center && center.lon) || lon,
        tags,
        typeId: action.payload,
      }));

      dispatch(objectsSetResult(result));
    } catch (err) {
      dispatchAxiosErrorAsToast(dispatch, 'objects.fetchingError', err);
    }
  },
};
