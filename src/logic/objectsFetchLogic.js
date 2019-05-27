import axios from 'axios';
import { createLogic } from 'redux-logic';

import * as at from 'fm3/actionTypes';
import { getMapLeafletElement } from 'fm3/leafletElementHolder';
import { getPoiType } from 'fm3/poiTypes';

import { objectsSetResult } from 'fm3/actions/objectsActions';
import { startProgress, stopProgress } from 'fm3/actions/mainActions';
import { toastsAddError } from 'fm3/actions/toastsActions';

export default createLogic({
  type: at.OBJECTS_SET_FILTER,
  cancelType: [at.OBJECTS_SET_FILTER, at.CLEAR_MAP],
  process(
    {
      action: { payload },
      cancelled$,
      storeDispatch,
    },
    dispatch,
    done,
  ) {
    const b = getMapLeafletElement().getBounds();
    const bbox = `${b.getSouth()},${b.getWest()},${b.getNorth()},${b.getEast()}`;

    const poiType = getPoiType(payload);

    const query = `[out:json][timeout:60]; ${poiType.overpassFilter.replace(
      /\{\{bbox\}\}/g,
      bbox,
    )}; out center;`;

    const pid = Math.random();
    dispatch(startProgress(pid));
    const source = axios.CancelToken.source();
    cancelled$.subscribe(() => {
      source.cancel();
    });

    axios
      .post(
        '//overpass-api.de/api/interpreter',
        `data=${encodeURIComponent(query)}`,
        {
          validateStatus: status => status === 200,
          cancelToken: source.token,
        },
      )
      .then(({ data }) => {
        const result = data.elements.map(({ id, center, tags, lat, lon }) => ({
          id,
          lat: (center && center.lat) || lat,
          lon: (center && center.lon) || lon,
          tags,
          typeId: payload,
        }));
        dispatch(objectsSetResult(result));
      })
      .catch(err => {
        dispatch(toastsAddError('objects.fetchingError', err));
      })
      .then(() => {
        storeDispatch(stopProgress(pid));
        done();
      });
  },
});
