import { mapRefocus } from 'fm3/actions/mapActions';
import { getMapLeafletElement } from 'fm3/leafletElementHolder';
import { Processor } from 'fm3/middlewares/processorMiddleware';

export const mapRefocusProcessor: Processor = {
  handle: async ({ dispatch, getState, prevState }) => {
    const prevMap = prevState.map;

    const { zoom, lat, lon } = getState().map;

    if (prevMap.lat === lat && prevMap.lon === lon && prevMap.zoom === zoom) {
      return;
    }

    const map = getMapLeafletElement();

    let fixedLon = lon % 360;

    if (fixedLon < 0) {
      fixedLon += 360;
    }

    if (
      map &&
      (map.getZoom() !== zoom ||
        map.getCenter().lat !== lat ||
        map.getCenter().lng !== fixedLon)
    ) {
      const fixing = map.getCenter().lng !== fixedLon;

      map.setView([lat, fixedLon], zoom, {
        animate: !fixing,
      });

      if (fixing) {
        dispatch(mapRefocus({ lon: fixedLon }));
      }
    }
  },
};
