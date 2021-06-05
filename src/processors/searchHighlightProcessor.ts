import { clearMap } from 'fm3/actions/mainActions';
import {
  searchSelectResult,
  searchSetResults,
} from 'fm3/actions/searchActions';
import { toastsAdd } from 'fm3/actions/toastsActions';
import { getMapLeafletElement } from 'fm3/leafletElementHolder';
import { baseLayers } from 'fm3/mapDefinitions';
import { Processor } from 'fm3/middlewares/processorMiddleware';
import { geoJSON } from 'leaflet';
import { getType } from 'typesafe-actions';

export const searchHighlightProcessor: Processor<typeof searchSelectResult> = {
  actionCreator: searchSelectResult,
  handle: async ({ action, dispatch, getState }) => {
    const le = getMapLeafletElement();

    if (le && action.payload) {
      const { geojson } = action.payload;

      const { mapType } = getState().map;

      le.fitBounds(geoJSON(geojson).getBounds(), {
        maxZoom:
          baseLayers.find((layer) => layer.type === mapType)?.maxNativeZoom ??
          16,
      });

      const { id, tags, osmType } = action.payload;

      if (tags) {
        dispatch(
          toastsAdd({
            id: 'mapDetails.tags',
            messageKey: 'mapDetails.detail',
            messageParams: {
              id,
              type: osmType,
              tags,
            },
            cancelType: [getType(clearMap), getType(searchSetResults)],
            style: 'info',
          }),
        );
      }
    }
  },
};
