import { clearMap } from 'fm3/actions/mainActions';
import {
  osmLoadNode,
  osmLoadRelation,
  osmLoadWay,
} from 'fm3/actions/osmActions';
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
      const { id, osmType, detailed, geojson } = action.payload;

      if (!detailed) {
        switch (osmType) {
          case 'node':
            dispatch(osmLoadNode(id));
            break;
          case 'way':
            dispatch(osmLoadWay(id));
            break;
          case 'relation':
            dispatch(osmLoadRelation(id));
            break;
        }
      }

      const { mapType } = getState().map;

      le.fitBounds(geoJSON(geojson).getBounds(), {
        maxZoom:
          baseLayers.find((layer) => layer.type === mapType)?.maxNativeZoom ??
          16,
      });

      dispatch(
        toastsAdd({
          id: 'mapDetails.tags',
          messageKey: 'mapDetails.detail',
          messageParams: {
            id,
            type: osmType,
            tags:
              (geojson.type === 'Feature'
                ? geojson.properties
                : geojson.features[0]?.properties) ?? {},
          },
          cancelType: [getType(clearMap), getType(searchSetResults)],
          style: 'info',
        }),
      );
    }
  },
};
