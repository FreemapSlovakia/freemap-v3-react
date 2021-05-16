import { getMapLeafletElement } from 'fm3/leafletElementHolder';
import { Processor } from 'fm3/middlewares/processorMiddleware';

export const mapRefocusProcessor: Processor = {
  handle: async ({ getState, prevState }) => {
    const prevMap = prevState.map;

    const { zoom, lat, lon } = getState().map;

    if (prevMap.lat === lat && prevMap.lon === lon && prevMap.zoom === zoom) {
      return;
    }

    const map = getMapLeafletElement();

    const fixedLon = ((lon + 180) % 360) - 180;

    if (
      map &&
      (map.getZoom() !== zoom ||
        map.getCenter().lat !== lat ||
        map.getCenter().lng !== fixedLon)
    ) {
      map.setView([lat, fixedLon], zoom);
    }
  },
};
