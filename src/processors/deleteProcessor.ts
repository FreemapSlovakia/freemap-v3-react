import {
  drawingLineDelete,
  drawingLineDeletePoint,
} from '../actions/drawingLineActions.js';
import { drawingPointDelete } from '../actions/drawingPointActions.js';
import { deleteFeature, selectFeature } from '../actions/mainActions.js';
import { routePlannerDelete } from '../actions/routePlannerActions.js';
import { trackingActions } from '../actions/trackingActions.js';
import { trackViewerDelete } from '../actions/trackViewerActions.js';
import { Processor } from '../middlewares/processorMiddleware.js';

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
