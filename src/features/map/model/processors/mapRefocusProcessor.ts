import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { mapPromise } from '../../hooks/leafletElementHolder.js';
import { mapRefocus } from '../actions.js';

export const mapRefocusProcessor: Processor = {
  handle: async ({ dispatch, getState, prevState }) => {
    const prevMap = prevState.map;

    const { zoom, lat, lon } = getState().map;

    if (prevMap.lat === lat && prevMap.lon === lon && prevMap.zoom === zoom) {
      return;
    }

    const map = await mapPromise;

    let fixedLon = lon;

    while (fixedLon < -180) {
      fixedLon += 360;
    }

    while (fixedLon > 180) {
      fixedLon -= 360;
    }

    if (
      map.getZoom() !== zoom ||
      map.getCenter().lat !== lat ||
      map.getCenter().lng !== fixedLon
    ) {
      const fixing = lon !== fixedLon;

      map.setView([lat, fixedLon], zoom, {
        animate: !fixing,
      });

      if (fixing) {
        dispatch(mapRefocus({ lon: fixedLon }));
      }
    }
  },
};
