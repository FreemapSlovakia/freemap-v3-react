import { searchSelectResult } from 'fm3/actions/searchActions';
import { getMapLeafletElement } from 'fm3/leafletElementHolder';
import { Processor } from 'fm3/middlewares/processorMiddleware';
import { geoJSON } from 'leaflet';

export const searchHighlightProcessor: Processor<typeof searchSelectResult> = {
  actionCreator: searchSelectResult,
  handle: async ({ action }) => {
    const le = getMapLeafletElement();

    if (le && action.payload) {
      const { geojson } = action.payload;

      le.fitBounds(
        geoJSON(geojson).getBounds(),
        geojson.type === 'Point' ? { maxZoom: 14 } : {},
      );
    }
  },
};
