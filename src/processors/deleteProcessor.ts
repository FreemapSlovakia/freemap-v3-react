import { deleteFeature, selectFeature } from '@app/store/actions.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import {
  drawingLineDelete,
  drawingLineDeletePoint,
} from '@features/drawing/model/actions/drawingLineActions.js';
import { drawingPointDelete } from '@features/drawing/model/actions/drawingPointActions.js';
import {
  routePlannerDelete,
  routePlannerRemovePoint,
} from '@features/routePlanner/model/actions.js';
import { searchSelectResult } from '@features/search/model/actions.js';
import { trackingActions } from '@features/tracking/model/actions.js';
import { trackViewerDelete } from '@features/trackViewer/model/actions.js';

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
      dispatch(selectFeature(null));

      dispatch(searchSelectResult(null));

      // dispatch(searchSetResults([]));

      // dispatch(searchSetQuery({ query: '' }));
    } else if (
      state.main.tool === 'track-viewer' ||
      state.main.tool === 'map-details'
    ) {
      dispatch(trackViewerDelete());
    } else if (state.main.tool === 'route-planner') {
      dispatch(routePlannerDelete());
    }
  },
};
