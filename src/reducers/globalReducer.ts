import { RootAction } from 'fm3/actions';
import {
  drawingLineAddPoint,
  drawingLineJoinFinish,
} from 'fm3/actions/drawingLineActions';
import { drawingPointAdd } from 'fm3/actions/drawingPointActions';
import { RootState } from 'fm3/reducers';
import { produce } from 'immer';
import { isActionOf } from 'typesafe-actions';

export function preGlobalReducer(
  state: RootState,
  action: RootAction,
): RootState {
  if (
    isActionOf(drawingLineJoinFinish, action) &&
    state.drawingLines.joinWith
  ) {
    // this is to fix selection on join

    return {
      ...state,
      main: {
        ...state.main,
        selection: {
          type: 'draw-line-poly',
          id:
            state.drawingLines.joinWith.lineIndex -
            (action.payload.lineIndex > state.drawingLines.joinWith.lineIndex
              ? 0
              : 1),
        },
      },
    };
  }

  return state;
}

export function postGlobalReducer(
  state: RootState,
  action: RootAction,
): RootState {
  if (isActionOf(drawingLineAddPoint, action)) {
    return produce(state, (draft) => {
      const index = action.payload.index ?? draft.drawingLines.lines.length - 1;

      draft.main.selection = {
        type: 'draw-line-poly',
        id: index,
      };
    });
  } else if (isActionOf(drawingPointAdd, action)) {
    return produce(state, (draft) => {
      draft.main.selection = {
        type: 'draw-points',
        id: draft.drawingPoints.points.length - 1,
      };
    });
  }

  return state;
}
