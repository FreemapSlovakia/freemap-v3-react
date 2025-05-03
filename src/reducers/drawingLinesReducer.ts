import { createReducer, isAnyOf } from '@reduxjs/toolkit';
import {
  drawingLineAdd,
  drawingLineAddPoint,
  drawingLineChangeProperties,
  drawingLineContinue,
  drawingLineDelete,
  drawingLineDeletePoint,
  drawingLineJoinFinish,
  drawingLineJoinStart,
  drawingLineRemovePoint,
  drawingLineSetLines,
  drawingLineSplit,
  drawingLineStopDrawing,
  drawingLineUpdatePoint,
  Line,
  Point,
} from '../actions/drawingLineActions.js';
import {
  applySettings,
  clearMapFeatures,
  selectFeature,
  setTool,
} from '../actions/mainActions.js';
import { mapsLoaded } from '../actions/mapsActions.js';

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

export const drawingLinesReducer = createReducer(initialState, (builder) =>
  builder
    .addCase(clearMapFeatures, () => initialState)
    .addCase(drawingLineAdd, (state, { payload }) => ({
      ...state,
      lines: [...state.lines, payload],
    }))
    .addCase(drawingLineChangeProperties, (state, { payload }) => {
      Object.assign(state.lines[payload.index], payload.properties);
    })
    .addCase(drawingLineDelete, (state, { payload }) => ({
      ...state,
      lines: state.lines.filter((_, i) => i !== payload.lineIndex),
    }))
    .addCase(drawingLineDeletePoint, (state, { payload }) => {
      const line = state.lines[payload.lineIndex];

      line.points = line.points.filter((point) => point.id !== payload.pointId);
    })
    .addCase(selectFeature, (state) => ({
      ...state,
      lines: state.lines.filter(linefilter),
      drawing: false,
      joinWith: undefined,
    }))
    .addCase(applySettings, (state, { payload }) => {
      if (payload.drawingApplyAll) {
        for (const line of state.lines) {
          if (payload.drawingColor) {
            line.color = payload.drawingColor;
          }

          if (payload.drawingWidth) {
            line.width = payload.drawingWidth;
          }
        }
      }
    })
    .addCase(drawingLineAddPoint, (state, action) => {
      let line;

      if ('lineProps' in action.payload) {
        const { lineProps } = action.payload;

        line = {
          type: lineProps.type,
          color: lineProps.color,
          width: lineProps.width,
          points: [],
        };

        state.lines.push(line);
      } else {
        line = state.lines[action.payload.lineIndex];
      }

      line.points.splice(
        action.payload.position === undefined
          ? line.points.length
          : action.payload.position,
        0,
        action.payload.point,
      );
    })
    .addCase(drawingLineUpdatePoint, (state, { payload: { index, point } }) => {
      const p = state.lines[index].points.find((pt) => pt.id === point.id);

      if (p) {
        Object.assign(p, point);
      }
    })
    .addCase(drawingLineRemovePoint, (state, action) => {
      const line = state.lines[action.payload.index];

      line.points = line.points.filter(
        (point) => point.id !== action.payload.id,
      );
    })
    .addCase(drawingLineSplit, (state, action) => {
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
    .addCase(drawingLineSetLines, (state, action) => ({
      ...state,
      lines: action.payload.filter(linefilter),
    }))
    .addCase(
      drawingLineContinue,
      (state, { payload: { pointId, lineIndex } }) => {
        state.drawing = true;

        const { points } = state.lines[lineIndex];

        if (points[0].id === pointId) {
          reverse(points);
        }
      },
    )
    .addCase(mapsLoaded, (state, { payload }) => ({
      ...state,
      joinWith: undefined,
      drawing: false,
      lines: [
        ...(payload.merge ? state.lines : []),
        ...(payload.data.lines ?? initialState.lines).map((line) => ({
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
    .addCase(drawingLineJoinStart, (state, action) => ({
      ...state,
      joinWith: action.payload,
    }))
    .addCase(drawingLineJoinFinish, (state, action) => {
      const { joinWith } = state;

      if (!joinWith) {
        return;
      }

      const line1 = state.lines[joinWith.lineIndex];

      if (line1.points[0].id === joinWith.pointId) {
        reverse(line1.points);
      }

      const line2 = state.lines[action.payload.lineIndex];

      if (line2.points[0].id !== action.payload.pointId) {
        reverse(line2.points);
      }

      state.lines[joinWith.lineIndex].label = [line1.label, line2.label]
        .filter((l) => l)
        .join(', ');

      const maxId = line1.points.reduce((a, b) => Math.max(a, b.id), -1) + 1;

      line1.points.push(
        ...line2.points.map((pt) => ({ ...pt, id: pt.id + maxId })),
      );

      state.lines.splice(action.payload.lineIndex, 1);

      state.joinWith = undefined;
    })
    .addMatcher(isAnyOf(setTool, drawingLineStopDrawing), (state) => ({
      ...state,
      drawing: false,
      joinWith: undefined,
    })),
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
