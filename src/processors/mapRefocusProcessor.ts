import { Processor } from 'fm3/middlewares/processorMiddleware';
import { mapRefocus } from 'fm3/actions/mapActions';
import { getMapLeafletElement } from 'fm3/leafletElementHolder';

export const mapRefocusProcessor: Processor = {
  actionCreator: mapRefocus,
  handle: async ({ getState }) => {
    const {
      map: { zoom, lat, lon },
    } = getState();

    const map = getMapLeafletElement();

    if (map) {
      if (map.getZoom() !== zoom) {
        map.setZoom(zoom);
      }

      if (map.getCenter().lat !== lat || map.getCenter().lng !== lon) {
        map.panTo([lat, lon]);
      }
    }
  },
};
