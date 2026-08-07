import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { fitMapToBbox } from '@features/map/fitMapToBbox.js';
import {
  osmLoadNode,
  osmLoadRelation,
  osmLoadWay,
} from '@features/osm/model/osmActions.js';
import { integratedLayerDefs, isBaseLayerDef } from '@shared/mapDefinitions.js';
import {
  featureIdsEqual,
  OsmFeatureIdSchema,
} from '@shared/types/featureId.js';
import bbox from '@turf/bbox';
import { searchSelectResult } from '../actions.js';

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

    const parsed = incomplete ? OsmFeatureIdSchema.safeParse(id) : undefined;

    if (parsed?.success) {
      switch (parsed.data.elementType) {
        case 'node':
          dispatch(
            osmLoadNode({
              id: parsed.data.id,
              focus: Boolean(action.payload.focus),
            }),
          );

          break;

        case 'way':
          dispatch(
            osmLoadWay({
              id: parsed.data.id,
              focus: Boolean(action.payload.focus),
            }),
          );

          break;

        case 'relation':
          dispatch(
            osmLoadRelation({
              id: parsed.data.id,
              focus: Boolean(action.payload.focus),
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

        await fitMapToBbox(
          dispatch,
          [bounds[0], bounds[1], bounds[2], bounds[3]],
          {
            maxZoom: Math.min(
              action.payload.result.zoom ?? 18,
              integratedLayerDefs
                .filter(isBaseLayerDef)
                .find((def) => layers.includes(def.type))?.maxNativeZoom ?? 16,
            ),
          },
        );
      }
    }
  },
};
