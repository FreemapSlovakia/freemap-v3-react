import { clearMap, convertToDrawing } from 'fm3/actions/mainActions';
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

export const searchHighlightTrafo: Processor<typeof searchSelectResult> = {
  actionCreator: searchSelectResult,
  transform({ action, getState }) {
    if (!action.payload || action.payload.result.detailed) {
      return action;
    }

    const { id, osmType } = action.payload.result;

    const sr = getState().search.selectedResult;

    if (!!sr && id === sr.id && osmType === sr.osmType && sr.detailed) {
      return;
    }

    return action;
  },
};

export const searchHighlightProcessor: Processor<typeof searchSelectResult> = {
  actionCreator: searchSelectResult,

  handle: async ({ action, dispatch, getState }) => {
    const le = getMapLeafletElement();

    if (!le || !action.payload) {
      return;
    }

    const { id, osmType, detailed, geojson, tags } = action.payload.result;

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

    if (action.payload.zoomTo !== false && geojson) {
      const { mapType } = getState().map;

      le.fitBounds(geoJSON(geojson).getBounds(), {
        maxZoom: Math.min(
          18,
          baseLayers.find((layer) => layer.type === mapType)?.maxNativeZoom ??
            16,
        ),
      });
    }

    if (detailed && id !== -1 && action.payload.showToast) {
      dispatch(
        toastsAdd({
          id: 'mapDetails.tags',
          messageKey: 'mapDetails.detail',
          messageParams: {
            id,
            type: osmType,
            tags,
          },
          cancelType: [
            getType(clearMap),
            getType(searchSetResults),
            getType(osmLoadNode),
            getType(osmLoadWay),
            getType(osmLoadRelation),
            getType(convertToDrawing),
          ],
          style: 'info',
        }),
      );
    }
  },
};
