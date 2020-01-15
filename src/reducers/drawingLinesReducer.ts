import produce from 'immer';
import { createReducer } from 'typesafe-actions';
import { RootAction } from 'fm3/actions';
import {
  clearMap,
  deleteFeature,
  selectFeature,
} from 'fm3/actions/mainActions';
import {
  drawingLineAddPoint,
  drawingLineUpdatePoint,
  drawingLineRemovePoint,
  drawingLineSetLines,
  Line,
} from 'fm3/actions/drawingActions';
import { mapsDataLoaded } from 'fm3/actions/mapsActions';

export interface DrawingLinesState {
  lines: Line[];
}

export const initialState: DrawingLinesState = {
  lines: [],
};

export const drawingLinesReducer = createReducer<DrawingLinesState, RootAction>(
  initialState,
)
  .handleAction(clearMap, () => initialState)
  .handleAction(selectFeature, state => ({
    ...state,
    lines: state.lines.filter(linefilter),
  }))
  .handleAction(drawingLineAddPoint, (state, action) =>
    produce(state, draft => {
      let line: Line;

      if (action.payload.index == null) {
        if (action.payload.type === undefined) {
          throw new Error();
        }

        line = { type: action.payload.type, points: [] };
        draft.lines.push(line);
      } else {
        line = draft.lines[action.payload.index];
      }

      line.points.splice(
        action.payload.position === undefined
          ? line.points.length
          : action.payload.position,
        0,
        action.payload.point,
      );
    }),
  )
  .handleAction(
    drawingLineUpdatePoint,
    (state, { payload: { index, point } }) =>
      produce(state, draft => {
        const p = draft.lines[index].points.find(pt => pt.id === point.id);
        if (p) {
          Object.assign(p, point);
        }
      }),
  )
  .handleAction(drawingLineRemovePoint, (state, action) =>
    produce(state, draft => {
      const line = draft.lines[action.payload.index];
      line.points = line.points.filter(point => point.id !== action.payload.id);
    }),
  )
  .handleAction(drawingLineSetLines, (state, action) => ({
    ...state,
    lines: action.payload.filter(linefilter),
  }))
  .handleAction(deleteFeature, (state, action) =>
    produce(state, draft => {
      if (
        (action.payload.type === 'draw-lines' ||
          action.payload.type === 'draw-polygons') &&
        action.payload.id !== undefined
      ) {
        draft.lines.splice(action.payload.id, 1);
      }
    }),
  )
  .handleAction(mapsDataLoaded, (_state, action) => {
    return { lines: action.payload.lines ?? [] };
  });

function linefilter(line) {
  return (
    (line.type === 'distance' && line.points.length > 1) ||
    (line.type === 'area' && line.points.length > 2)
  );
}
