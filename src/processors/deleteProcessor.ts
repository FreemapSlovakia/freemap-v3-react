import {
  drawingLineDelete,
  drawingLineDeletePoint,
} from 'fm3/actions/drawingLineActions';
import { drawingPointDelete } from 'fm3/actions/drawingPointActions';
import { deleteFeature } from 'fm3/actions/mainActions';
import { routePlannerDelete } from 'fm3/actions/routePlannerActions';
import { trackingActions } from 'fm3/actions/trackingActions';
import { trackViewerDelete } from 'fm3/actions/trackViewerActions';
import { Processor } from 'fm3/middlewares/processorMiddleware';

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
      dispatch(drawingLineDelete({ lineIndex: state.main.selection.id }));
    } else if (state.main.selection?.type === 'draw-points') {
      dispatch(drawingPointDelete({ index: state.main.selection.id }));
    } else if (state.main.selection?.type === 'tracking') {
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
