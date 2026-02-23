import bbox from '@turf/bbox';
import { is } from 'typia';
import {
  clearMapFeatures,
  convertToDrawing,
  selectFeature,
} from '../../../../actions/mainActions.js';
import {
  osmLoadNode,
  osmLoadRelation,
  osmLoadWay,
} from '../../../../actions/osmActions.js';
import { searchSelectResult, searchSetResults } from '../actions.js';
import { toastsAdd } from '../../../toasts/model/actions.js';
import { mapPromise } from '../../../../leafletElementHolder.js';
import {
  HasMaxNativeZoom,
  integratedLayerDefs,
  IsBaseLayerDef,
} from '../../../../mapDefinitions.js';
import type { Processor } from '../../../../middlewares/processorMiddleware.js';
import { featureIdsEqual, OsmFeatureId } from '../../../../types/featureId.js';

export const searchHighlightTrafo: Processor<typeof searchSelectResult> = {
  actionCreator: searchSelectResult,
  transform({ action, getState }) {
    if (
      !action.payload ||
      action.payload.result.geojson.type === 'FeatureCollection' ||
      action.payload.result.geojson.geometry
    ) {
      return action;
    }

    const { id } = action.payload.result;

    const sr = getState().search.selectedResult;

    if (
      sr &&
      featureIdsEqual(id, sr.id) &&
      (sr.geojson.type === 'FeatureCollection' || sr.geojson.geometry)
    ) {
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

    const { id, geojson, incomplete } = action.payload.result;

    if (incomplete && is<OsmFeatureId>(id)) {
      switch (id.elementType) {
        case 'node':
          dispatch(
            osmLoadNode({
              id: id.id,
              focus: !!action.payload.focus,
              showToast: action.payload.showToast,
            }),
          );

          break;

        case 'way':
          dispatch(
            osmLoadWay({
              id: id.id,
              focus: !!action.payload.focus,
              showToast: action.payload.showToast,
            }),
          );

          break;

        case 'relation':
          dispatch(
            osmLoadRelation({
              id: id.id,
              focus: !!action.payload.focus,
              showToast: action.payload.showToast,
            }),
          );

          break;
      }
    }

    if (action.payload.focus !== false && geojson) {
      let bounds;

      try {
        bounds = bbox(geojson);
      } catch {
        // ignore
      }

      if (bounds) {
        const { layers } = getState().map;

        (await mapPromise).fitBounds(
          [
            [bounds[1], bounds[0]],
            [bounds[3], bounds[2]],
          ],
          {
            maxZoom: Math.min(
              action.payload.result.zoom ?? 18,
              integratedLayerDefs
                .filter((def) => is<IsBaseLayerDef & HasMaxNativeZoom>(def))
                .find((def) => layers.includes(def.type))?.maxNativeZoom ?? 16,
            ),
          },
        );
      }
    }

    if (action.payload.showToast) {
      dispatch(
        toastsAdd({
          id: 'mapDetails.tags',
          messageKey: 'mapDetails.detail',
          messageParams: { result: action.payload.result },
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
