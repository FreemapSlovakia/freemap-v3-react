import {
  deleteFeature,
  type Selection,
  selectFeature,
  selectionRenumbered,
} from '@app/store/actions.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { isToolOpen } from '@app/store/selectors.js';
import type { RootState } from '@app/store/store.js';
import {
  dataViewerDelete,
  dataViewerDeleteFeature,
} from '@features/dataViewer/model/actions.js';
import {
  drawingLineDelete,
  drawingLineDeletePoint,
} from '@features/drawing/model/actions/drawingLineActions.js';
import { drawingPointDelete } from '@features/drawing/model/actions/drawingPointActions.js';
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
    case 'line-point':
      dispatch(
        drawingLineDeletePoint({
          lineIndex: target.lineIndex,
          pointId: target.pointId,
        }),
      );

      break;

    case 'draw-line-poly':
      dispatch(drawingLineDelete({ lineIndex: target.id }));

      break;

    case 'draw-points':
      dispatch(drawingPointDelete({ index: target.id }));

      break;

    case 'tracking':
      dispatch(trackingActions.delete({ token: target.id }));

      break;

    case 'route-point':
      dispatch(routePlannerRemovePoint(target.id));

      break;

    // Only that feature goes; the rest of the imported data stays.
    case 'data-viewer':
      dispatch(dataViewerDeleteFeature(target.id));

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
const DESELECT_FIRST = new Set<Selection['type']>([
  'draw-line-poly',
  'draw-points',
  'tracking',
  'route-point',
]);

/** Where the line at `index` sits in `after`, found by its id. */
function lineIndexAfter(
  index: number,
  before: RootState,
  after: RootState,
): number | undefined {
  const id = before.drawingLines.lines[index]?.id;

  const at = after.drawingLines.lines.findIndex((line) => line.id === id);

  return at === -1 ? undefined : at;
}

/**
 * `kept` once `removed` is gone, or null where it went too: lines found again
 * by id, as a polygon takes its holes; the other kinds selected by position
 * moved up one past the removed item.
 */
function selectionAfterRemoval(
  kept: Selection,
  removed: Selection,
  before: RootState,
  after: RootState,
): Selection | null {
  if (removed.type === 'draw-line-poly') {
    const lineAfter = (index: number) => lineIndexAfter(index, before, after);

    if (kept.type === 'line-point') {
      const at = lineAfter(kept.lineIndex);

      return at === undefined ? null : { ...kept, lineIndex: at };
    }

    if (kept.type === 'draw-line-poly') {
      const at = lineAfter(kept.id);

      return at === undefined ? null : { ...kept, id: at };
    }
  }

  // Its legs are rebuilt without the point.
  if (removed.type === 'route-point' && kept.type === 'route-leg') {
    return null;
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

    // Another feature than the selected one, from a list: the selection stays,
    // touched only where the deletion renumbers it.
    if (target && !sameSelection(target, selection)) {
      if (!DELETABLE_SELECTIONS.has(target.type)) {
        return undefined;
      }

      deleteOne(dispatch, target);

      if (selection) {
        const after = getState();

        const next = selectionAfterRemoval(selection, target, state, after);

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

      if (selection.type === 'draw-line-poly') {
        // Deselecting drops unfinished lines, renumbering the rest.
        const at = lineIndexAfter(selection.id, state, getState());

        if (at !== undefined) {
          deleteOne(dispatch, { ...selection, id: at });
        }
      } else {
        deleteOne(dispatch, selection);
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
      if (state.main.mapTool === 'route-planner') {
        dispatch(routePlannerDelete());
      } else if (isToolOpen(state, 'import-file')) {
        dispatch(dataViewerDelete());
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
