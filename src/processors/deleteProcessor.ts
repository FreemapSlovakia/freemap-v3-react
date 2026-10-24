import {
  deleteFeature,
  type Selection,
  selectFeature,
  selectionRenumbered,
} from '@app/store/actions.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import {
  dataViewerDeleteFeature,
  dataViewerDeleteHole,
  dataViewerDeleteVertex,
} from '@features/dataViewer/model/actions.js';
import { objectsSetFilter } from '@features/objects/model/actions.js';
import {
  routePlannerDelete,
  routePlannerRemovePoint,
} from '@features/routePlanner/model/actions.js';
import { searchUnselectResult } from '@features/search/model/actions.js';
import { trackingActions } from '@features/tracking/model/actions.js';
import type { Dispatch } from '@reduxjs/toolkit';
import { DELETABLE_SELECTIONS, sameSelection } from '@shared/selection.js';

/** Deletes one feature, leaving the selection to the caller. */
function deleteOne(dispatch: Dispatch, target: Selection): void {
  switch (target.type) {
    case 'vertex':
      dispatch(
        dataViewerDeleteVertex({
          index: target.id,
          part: target.part,
          vertex: target.vertex,
        }),
      );

      break;

    // Only that feature goes, or the hole of it that is picked.
    case 'feature':
      dispatch(
        target.part
          ? dataViewerDeleteHole({ index: target.id, part: target.part })
          : dataViewerDeleteFeature(target.id),
      );

      break;

    case 'tracking':
      dispatch(trackingActions.delete({ token: target.id }));

      break;

    case 'route-point':
      dispatch(routePlannerRemovePoint(target.id));

      break;

    // Only that result goes; the others stay on the map. For one only being
    // looked at, which has no delete button of its own, this is the way to
    // say so outright.
    case 'search':
      dispatch(searchUnselectResult(target.id));

      break;
  }
}

// Selected, these are deselected before they go; the rest clear themselves.
const DESELECT_FIRST = new Set<Selection['type']>(['tracking', 'route-point']);

/**
 * `kept` once `removed` is gone, or null where it went too: each kind selected
 * by position, moved up one past the removed item.
 */
function selectionAfterRemoval(
  kept: Selection,
  removed: Selection,
  /** The feature went as a whole — a vertex taking its line with it. */
  featureGone: boolean,
): Selection | null {
  if (
    (removed.type === 'feature' || removed.type === 'vertex') &&
    (kept.type === 'feature' || kept.type === 'vertex')
  ) {
    const hole = removed.type === 'feature' ? removed.part : undefined;

    // A hole going renumbers its polygon's later rings, not the features.
    if (hole) {
      if (kept.id !== removed.id || !kept.part || kept.part < hole) {
        return kept;
      }

      return kept.part === hole ? null : { ...kept, part: kept.part - 1 };
    }

    if (removed.type === 'feature' || featureGone) {
      return kept.id === removed.id
        ? null
        : kept.id > removed.id
          ? { ...kept, id: kept.id - 1 }
          : kept;
    }
  }

  // Its legs are rebuilt without the point.
  if (removed.type === 'route-point' && kept.type === 'route-leg') {
    return null;
  }

  // A vertex going renumbers only the later vertices of its own part.
  if (removed.type === 'vertex') {
    if (
      kept.type !== 'vertex' ||
      kept.id !== removed.id ||
      kept.part !== removed.part
    ) {
      return kept;
    }

    return kept.vertex === removed.vertex
      ? null
      : kept.vertex > removed.vertex
        ? { ...kept, vertex: kept.vertex - 1 }
        : kept;
  }

  if (
    kept.type === removed.type &&
    'id' in kept &&
    'id' in removed &&
    typeof kept.id === 'number' &&
    typeof removed.id === 'number' &&
    kept.id > removed.id
  ) {
    return { ...kept, id: kept.id - 1 } as Selection;
  }

  return kept;
}

export const deleteProcessor: Processor<typeof deleteFeature> = {
  actionCreator: deleteFeature,
  id: 'deleteFeature',
  transform: ({ getState, dispatch, action }) => {
    const state = getState();

    const { selection } = state.main;

    const target = action.payload;

    // Read before and after a deletion: whether a feature went as a whole.
    const count = () => getState().trackViewer.trackGeojson?.features.length;

    // Another feature than the selected one, from a list: the selection stays,
    // touched only where the deletion renumbers it.
    if (target && !sameSelection(target, selection)) {
      if (!DELETABLE_SELECTIONS.has(target.type)) {
        return undefined;
      }

      const before = count();

      deleteOne(dispatch, target);

      if (selection) {
        const after = getState();

        const next = selectionAfterRemoval(
          selection,
          target,
          count() !== before,
        );

        // A route point's pick mode depends on its place, which can change
        // without its index.
        if (
          !sameSelection(next, after.main.selection) ||
          target.type === 'route-point'
        ) {
          dispatch(selectionRenumbered(next));
        }
      }

      return undefined;
    }

    if (selection && DELETABLE_SELECTIONS.has(selection.type)) {
      if (DESELECT_FIRST.has(selection.type)) {
        dispatch(selectFeature(null));
      }

      const before = count();

      deleteOne(dispatch, selection);

      // A deleted vertex or hole leaves its feature selected: kept, the address
      // would name the next vertex or ring instead. Unless the feature went with
      // it, when the same index names the next one.
      if (
        selection.type === 'vertex' ||
        (selection.type === 'feature' && selection.part)
      ) {
        dispatch(
          selectionRenumbered(
            count() === before ? { type: 'feature', id: selection.id } : null,
          ),
        );
      }
    } else if (selection === null) {
      // Nothing is selected, so Del means "delete all of the open tool's" — of
      // the tools that have such a thing, the one owning map clicks goes first,
      // it being what the map is currently for.
      //
      // A selection that has no delete of its own — a route leg, an object —
      // stops at this test instead of reaching the deletions below: the leg is
      // the stretch between two waypoints and the object isn't the user's, so
      // there is nothing there to remove, and taking the whole route or the
      // imported track away for it would be no answer at all.
      //
      // Drawing and data has no such Del: one keypress would take every drawn
      // and imported feature. The Map layers panel's Remove does that instead.
      if (state.main.mapTool === 'route-planner') {
        dispatch(routePlannerDelete());
      } else if (!window.fmEmbedded && state.objects.active.length > 0) {
        // Taking the predicate away is what takes the objects off the map —
        // they are fetched for as long as it is set. Keyed off the predicate
        // rather than a toolbar, objects having none to open; last of the
        // lot, so no other toolbar's Del changes meaning for objects showing
        // beside it. Not in an embed, where the filter is the host's and the
        // toolbar that would otherwise clear it is withheld for that reason.
        dispatch(objectsSetFilter([]));
      }
    }
  },
};
