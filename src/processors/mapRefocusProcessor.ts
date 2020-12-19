import { mapRefocus } from 'fm3/actions/mapActions';
import { getMapLeafletElement } from 'fm3/leafletElementHolder';
import { Processor } from 'fm3/middlewares/processorMiddleware';

export const mapRefocusProcessor: Processor = {
  actionCreator: mapRefocus,
  handle: async ({ getState }) => {
    const {
      map: { zoom, lat, lon },
    } = getState();

    const map = getMapLeafletElement();

    if (
      map &&
      (map.getZoom() !== zoom ||
        map.getCenter().lat !== lat ||
        map.getCenter().lng !== lon)
    ) {
      map.setView([lat, lon], zoom);
    }
  },
};
