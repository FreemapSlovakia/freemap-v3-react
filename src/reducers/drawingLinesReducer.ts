import { RootAction } from 'fm3/actions';
import {
  drawingLineAddPoint,
  drawingLineContinue,
  drawingLineJoinFinish,
  drawingLineJoinStart,
  drawingLineRemovePoint,
  drawingLineSetLines,
  drawingLineSplit,
  drawingLineStopDrawing,
  drawingLineUpdatePoint,
  Line,
  Point,
} from 'fm3/actions/drawingLineActions';
import { clearMap, selectFeature, setTool } from 'fm3/actions/mainActions';
import { mapsDataLoaded } from 'fm3/actions/mapsActions';
import produce from 'immer';
import { createReducer } from 'typesafe-actions';

export interface DrawingLinesState {
  drawing: boolean;
  lines: Line[];
  joinWith: undefined | { lineIndex: number; pointId: number };
}

export const initialState: DrawingLinesState = {
  drawing: false,
  lines: [],
  joinWith: undefined,
};

export const drawingLinesReducer = createReducer<DrawingLinesState, RootAction>(
  initialState,
)
  .handleAction(clearMap, () => initialState)
  .handleAction([setTool, drawingLineStopDrawing], (state) => ({
    ...state,
    drawing: false,
    joinWith: undefined,
  }))
  .handleAction(selectFeature, (state) => ({
    ...state,
    lines: state.lines.filter(linefilter),
    drawing: false,
    joinWith: undefined,
  }))
  .handleAction(drawingLineAddPoint, (state, action) =>
    produce(state, (draft) => {
      let line: Line;

      if (action.payload.index === undefined) {
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
    const { lineIndex, pointId } = action.payload;

    const line = state.lines[lineIndex];

    const pos = line.points.findIndex((pt) => pt.id === pointId);

    return {
      ...state,
      lines: [
        ...state.lines.slice(0, lineIndex),
        {
          ...line,
          points: line.points.slice(0, pos + 1),
        },
        { ...line, points: line.points.slice(pos) },
        ...state.lines.slice(lineIndex + 1),
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
          reverse(points);
        }
      }),
  )
  .handleAction(mapsDataLoaded, (state, { payload }) => ({
    joinWith: undefined,
    drawing: false,
    lines: [
      ...(payload.merge ? state.lines : []),
      ...(payload.lines ?? initialState.lines).map((line) => ({
        ...line,
        type:
          // compatibility
          (line.type as string) === 'area'
            ? 'polygon'
            : (line.type as string) === 'distance'
            ? 'line'
            : line.type,
      })),
    ],
  }))
  .handleAction(drawingLineJoinStart, (state, action) => ({
    ...state,
    joinWith: action.payload,
  }))
  .handleAction(drawingLineJoinFinish, (state, action) =>
    produce(state, (draft) => {
      const { joinWith } = draft;

      if (!joinWith) {
        return;
      }

      const line1 = draft.lines[joinWith.lineIndex];

      if (line1.points[0].id === joinWith.pointId) {
        reverse(line1.points);
      }

      const line2 = draft.lines[action.payload.lineIndex];

      if (line2.points[0].id !== action.payload.pointId) {
        reverse(line2.points);
      }

      draft.lines[joinWith.lineIndex].label = [line1.label, line2.label]
        .filter((l) => l)
        .join(', ');

      const maxId = line1.points.reduce((a, b) => Math.max(a, b.id), -1) + 1;

      line1.points.push(
        ...line2.points.map((pt) => ({ ...pt, id: pt.id + maxId })),
      );

      draft.lines.splice(action.payload.lineIndex, 1);

      draft.joinWith = undefined;
    }),
  );

function linefilter(line: Line) {
  return (
    (line.type === 'line' && line.points.length > 1) ||
    (line.type === 'polygon' && line.points.length > 2)
  );
}

function reverse(points: Point[]) {
  const ids = points.map((p) => p.id);

  points.reverse();

  for (let i = 0; i < ids.length; i++) {
    points[i].id = ids[i];
  }
}
