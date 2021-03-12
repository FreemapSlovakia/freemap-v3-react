import { RootAction } from 'fm3/actions';
import {
  drawingLineAddPoint,
  drawingLineContinue,
  drawingLineRemovePoint,
  drawingLineSetLines,
  drawingLineSplit,
  drawingLineUpdatePoint,
  Line,
} from 'fm3/actions/drawingLineActions';
import { clearMap, selectFeature, setTool } from 'fm3/actions/mainActions';
import { mapsDataLoaded } from 'fm3/actions/mapsActions';
import produce from 'immer';
import { createReducer } from 'typesafe-actions';

export interface DrawingLinesState {
  drawing: boolean;
  lines: Line[];
}

export const initialState: DrawingLinesState = {
  drawing: false,
  lines: [],
};

export const drawingLinesReducer = createReducer<DrawingLinesState, RootAction>(
  initialState,
)
  .handleAction(clearMap, () => initialState)
  .handleAction(setTool, (state) => ({
    ...state,
    drawing: false,
  }))
  .handleAction(selectFeature, (state) => ({
    ...state,
    lines: state.lines.filter(linefilter),
    drawing: false,
  }))
  .handleAction(drawingLineAddPoint, (state, action) =>
    produce(state, (draft) => {
      let line: Line;

      if (action.payload.index == null) {
        if (action.payload.type === undefined) {
          throw new Error();
        }

        line = { type: action.payload.type, points: [], label: '' };
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
      produce(state, (draft) => {
        const p = draft.lines[index].points.find((pt) => pt.id === point.id);

        if (p) {
          Object.assign(p, point);
        }
      }),
  )
  .handleAction(drawingLineRemovePoint, (state, action) =>
    produce(state, (draft) => {
      const line = draft.lines[action.payload.index];

      line.points = line.points.filter(
        (point) => point.id !== action.payload.id,
      );
    }),
  )
  .handleAction(drawingLineSplit, (state, action) => {
    const line = state.lines[action.payload.lineIndex];

    return {
      ...state,
      lines: [
        ...state.lines.filter((lin) => line !== lin),
        {
          ...line,
          points: line.points.slice(0, action.payload.pointId + 1),
        },
        { ...line, points: line.points.slice(action.payload.pointId) },
      ],
    };
  })
  .handleAction(drawingLineSetLines, (state, action) => ({
    ...state,
    lines: action.payload.filter(linefilter),
  }))
  .handleAction(
    drawingLineContinue,
    (state, { payload: { pointId, lineIndex } }) =>
      produce(state, (draft) => {
        draft.drawing = true;

        const { points } = draft.lines[lineIndex];

        if (points[0].id === pointId) {
          const ids = points.map((p) => p.id);

          points.reverse();

          for (let i = 0; i < ids.length; i++) {
            points[i].id = ids[i];
          }
        }
      }),
  )
  .handleAction(mapsDataLoaded, (_state, action) => ({
    drawing: false,
    lines: (action.payload.lines ?? initialState.lines).map((line) => ({
      ...line,
      type:
        // compatibility
        (line.type as string) === 'area'
          ? 'polygon'
          : (line.type as string) === 'distance'
          ? 'line'
          : line.type,
    })),
  }));

function linefilter(line: Line) {
  return (
    (line.type === 'line' && line.points.length > 1) ||
    (line.type === 'polygon' && line.points.length > 2)
  );
}
