import { deleteFeature, selectFeature } from '@app/store/actions.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { isToolOpen } from '@app/store/selectors.js';
import { dataViewerDelete } from '@features/dataViewer/model/actions.js';
import {
  drawingLineDelete,
  drawingLineDeletePoint,
} from '@features/drawing/model/actions/drawingLineActions.js';
import { drawingPointDelete } from '@features/drawing/model/actions/drawingPointActions.js';
import {
  routePlannerDelete,
  routePlannerRemovePoint,
} from '@features/routePlanner/model/actions.js';
import { searchUnselectResult } from '@features/search/model/actions.js';
import { trackingActions } from '@features/tracking/model/actions.js';

export const deleteProcessor: Processor = {
  actionCreator: deleteFeature,
  id: 'deleteFeature',
  transform: ({ getState, dispatch }) => {
    const state = getState();

    if (state.main.selection?.type === 'line-point') {
      dispatch(
        drawingLineDeletePoint({
          lineIndex: state.main.selection.lineIndex,
          pointId: state.main.selection.pointId,
        }),
      );
    } else if (state.main.selection?.type === 'draw-line-poly') {
      dispatch(selectFeature(null));

      dispatch(drawingLineDelete({ lineIndex: state.main.selection.id }));
    } else if (state.main.selection?.type === 'draw-points') {
      dispatch(selectFeature(null));

      dispatch(drawingPointDelete({ index: state.main.selection.id }));
    } else if (state.main.selection?.type === 'tracking') {
      dispatch(selectFeature(null));

      dispatch(trackingActions.delete({ token: state.main.selection.id }));
    } else if (state.main.selection?.type === 'route-point') {
      dispatch(selectFeature(null));

      dispatch(routePlannerRemovePoint(state.main.selection.id));
    } else if (state.main.selection?.type === 'search') {
      // Only the result acted upon goes; the others stay on the map. The search
      // toolbar carries no delete button — a result is taken off it by not
      // being kept and being looked away from — so this is the shortcut for
      // doing both at once.
      dispatch(searchUnselectResult(state.main.selection.id));
    } else if (state.main.selection === null) {
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
      }
    }
  },
};
