import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { fitMapToBbox } from '@features/map/fitMapToBbox.js';
import { layerInstancesSelector } from '@features/map/model/selectors.js';
import { integratedLayerDefMapSelector } from '@features/mapLibrary/model/selectors.js';
import { osmLoad } from '@features/osm/model/osmActions.js';
import {
  featureIdsEqual,
  OsmFeatureIdSchema,
} from '@shared/types/featureId.js';
import bbox from '@turf/bbox';
import { searchSelectResult } from '../actions.js';
import { hasGeometry } from '../resultUtils.js';

/**
 * Keeps a result that is already on the map from being taken back to the
 * stand-in the list holds it in — picking a geocoding hit a second time would
 * otherwise drop the element loaded for it and fetch it again. The pick still
 * goes through, so it makes its result the active one; only the result itself
 * is swapped for the one already shown.
 *
 * `incomplete` is what tells the two apart, not geometry: a geocoding hit
 * arrives with a centroid, so it has geometry from the start and is still
 * waiting for the outline and the rest of its tags.
 */
export const searchHighlightTrafo: Processor<typeof searchSelectResult> = {
  actionCreator: searchSelectResult,
  transform({ action, getState }) {
    if (!action.payload?.result.incomplete) {
      return action;
    }

    const { id } = action.payload.result;

    const shown = getState().search.selectedResults.find((result) =>
      featureIdsEqual(id, result.id),
    );

    return shown && !shown.incomplete && hasGeometry(shown)
      ? { ...action, payload: { ...action.payload, result: shown } }
      : action;
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
      dispatch(
        osmLoad({
          ids: [parsed.data],
          // A result that is nothing but an id has nothing to fit to yet, so
          // the map is taken to the element once it lands instead.
          focus:
            action.payload.focus !== false &&
            !hasGeometry(action.payload.result),
        }),
      );
    }

    // The fit belongs to the result being looked at. An element kept on the map
    // while its fetch ran lands after the user has moved on to another one, and
    // would otherwise yank the map back to itself.
    const { selection } = getState().main;

    if (
      action.payload.focus !== false &&
      hasGeometry(action.payload.result) &&
      selection?.type === 'search' &&
      featureIdsEqual(selection.id, id)
    ) {
      let bounds;

      try {
        bounds = bbox(geojson);
      } catch {
        // ignore
      }

      if (bounds) {
        const defs = integratedLayerDefMapSelector(getState());

        // A preset's layer goes by its own kind, a loose map by its def's.
        const baseDef = layerInstancesSelector(getState())
          .filter((inst) => (inst.kind ?? defs[inst.type]?.layer) === 'base')
          .map((inst) => defs[inst.type])
          .find((def) => def !== undefined);

        await fitMapToBbox(
          dispatch,
          [bounds[0], bounds[1], bounds[2], bounds[3]],
          {
            maxZoom: Math.min(
              action.payload.result.zoom ?? 18,
              (baseDef && 'maxNativeZoom' in baseDef
                ? baseDef.maxNativeZoom
                : undefined) ?? 16,
            ),
          },
        );
      }
    }
  },
};
