import { mapRefocus } from 'fm3/actions/mapActions';
import { getMapLeafletElement } from 'fm3/leafletElementHolder';
import { Processor } from 'fm3/middlewares/processorMiddleware';

export const mapRefocusProcessor: Processor<typeof mapRefocus> = {
  actionCreator: mapRefocus,
  handle: async ({ getState, action }) => {
    if (
      action.payload.lat === undefined &&
      action.payload.lon === undefined &&
      action.payload.zoom === undefined
    ) {
      return;
    }

    const { zoom, lat, lon } = getState().map;

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
