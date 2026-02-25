import {
  clearMapFeatures,
  convertToDrawing,
  selectFeature,
} from '@app/store/actions.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { mapPromise } from '@features/map/hooks/leafletElementHolder.js';
import {
  osmLoadNode,
  osmLoadRelation,
  osmLoadWay,
} from '@features/osm/model/osmActions.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import {
  HasMaxNativeZoom,
  integratedLayerDefs,
  IsBaseLayerDef,
} from '@shared/mapDefinitions.js';
import { featureIdsEqual, OsmFeatureId } from '@shared/types/featureId.js';
import bbox from '@turf/bbox';
import { is } from 'typia';
import { searchSelectResult, searchSetResults } from '../actions.js';

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
