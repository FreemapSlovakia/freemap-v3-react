import {
  clearMapFeatures,
  convertToDrawing,
  selectFeature,
} from 'fm3/actions/mainActions';
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
import { mapPromise } from 'fm3/leafletElementHolder';
import { baseLayers } from 'fm3/mapDefinitions';
import { Processor } from 'fm3/middlewares/processorMiddleware';
import { geoJSON } from 'leaflet';

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
    if (!action.payload) {
      return;
    }

    const { id, osmType, detailed, geojson, tags } = action.payload.result;

    if (!detailed) {
      switch (osmType) {
        case 'node':
          dispatch(
            osmLoadNode({
              id,
              focus: true,
              showToast: action.payload.showToast,
            }),
          );

          break;

        case 'way':
          dispatch(
            osmLoadWay({
              id,
              focus: true,
              showToast: action.payload.showToast,
            }),
          );

          break;

        case 'relation':
          dispatch(
            osmLoadRelation({
              id,
              focus: true,
              showToast: action.payload.showToast,
            }),
          );

          break;
      }
    }

    if (action.payload.focus !== false && geojson) {
      const { mapType } = getState().map;

      (await mapPromise).fitBounds(geoJSON(geojson).getBounds(), {
        maxZoom: Math.min(
          action.payload.result.zoom ?? 18,
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
            clearMapFeatures.type,
            searchSetResults.type,
            osmLoadNode.type,
            osmLoadWay.type,
            osmLoadRelation.type,
            convertToDrawing.type,
            selectFeature.type,
          ],
          style: 'info',
        }),
      );
    }
  },
};
