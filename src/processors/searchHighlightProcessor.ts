import { searchHighlightResult } from 'fm3/actions/searchActions';
import { Processor } from 'fm3/middlewares/processorMiddleware';
import { getMapLeafletElement } from 'fm3/leafletElementHolder';
import { geoJSON } from 'leaflet';

export const searchHighlightProcessor: Processor<
  typeof searchHighlightResult
> = {
  actionCreator: searchHighlightResult,
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
