import {
  applySettings,
  clearMapFeatures,
  closeTool,
  openTool,
  selectFeature,
} from '@app/store/actions.js';
import { mapsLoaded } from '@features/myMaps/model/actions.js';
import { createReducer } from '@reduxjs/toolkit';
import { isDrawTool, isMapClickTool } from '@shared/toolDefinitions.js';
import { serializeDrawingLine } from '@shared/urlSerialization.js';
import { lineString } from '@turf/helpers';
import { simplify as turfSimplify } from '@turf/simplify';
import {
  type DrawnLine,
  drawingLineAdd,
  drawingLineAddPoint,
  drawingLineChangeProperties,
  drawingLineContinue,
  drawingLineDelete,
  drawingLineDeletePoint,
  drawingLineJoinFinish,
  drawingLineJoinStart,
  drawingLineRemovePoint,
  drawingLineReverse,
  drawingLineSetLines,
  drawingLineSimplify,
  drawingLineSplit,
  drawingLineStopDrawing,
  drawingLineUpdatePoint,
  type Line,
  type Point,
} from '../actions/drawingLineActions.js';

export interface DrawingLinesState {
  drawing: boolean;
  lines: DrawnLine[];
  joinWith: undefined | { lineIndex: number; pointId: number };
}

export const initialState: DrawingLinesState = {
  drawing: false,
  lines: [],
  joinWith: undefined,
};

// Line ids are handed out here because the reducer is the one funnel every
// line reaches the store through — a URL parse, a loaded map, a conversion, a
// split, the draw tool — so no caller has to remember to supply one. Monotonic
// rather than `max + 1`, so an id is never reused by a later line and anything
// holding one (the elevation chart) can't be silently re-pointed.
let nextLineId = 0;

function withId(line: Line): DrawnLine {
  return { ...line, id: ++nextLineId };
}

// Everything a `Line` is, minus its id: `serializeDrawingLine` covers every
// field except `type`, which the URL carries as the param name instead.
function lineIdentity(line: Line): string {
  return `${line.type}\x1f${serializeDrawingLine(line)}`;
}

export const drawingLinesReducer = createReducer(initialState, (builder) =>
  builder
    .addCase(clearMapFeatures, () => initialState)
    .addCase(drawingLineAdd, (state, { payload }) => ({
      ...state,
      lines: [...state.lines, withId(payload)],
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
      if (!payload.drawingApplyAll) {
        return;
      }

      const { drawing } = payload;

      for (const line of state.lines) {
        Object.assign(line, drawing);
      }
    })
    .addCase(drawingLineAddPoint, (state, action) => {
      let line;

      if ('lineProps' in action.payload) {
        const { lineProps } = action.payload;

        line = withId({
          type: lineProps.type,
          color: lineProps.color,
          fillColor: lineProps.fillColor,
          width: lineProps.width,
          dashArray: lineProps.dashArray,
          lineCap: lineProps.lineCap,
          lineJoin: lineProps.lineJoin,
          points: [],
        });

        state.lines.push(line);
      } else {
        line = state.lines[action.payload.lineIndex];
      }

      if (action.payload.drawing) {
        state.drawing = true;
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
    .addCase(drawingLineReverse, (state, { payload: { lineIndex } }) => {
      reverse(state.lines[lineIndex].points);
    })
    .addCase(
      drawingLineSimplify,
      (state, { payload: { lineIndex, tolerance } }) => {
        const line = state.lines[lineIndex];

        if (line.points.length < 3) {
          return;
        }

        const ls = lineString(line.points.map((p) => [p.lon, p.lat]));

        turfSimplify(ls, { mutate: true, highQuality: true, tolerance });

        line.points = ls.geometry.coordinates.map((c, id) => ({
          lat: c[1]!,
          lon: c[0]!,
          id,
        }));
      },
    )
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
          // The tail is a new line, so it gets its own id; the head keeps the
          // original's, which is what an open chart on it goes on following.
          withId({ ...line, points: line.points.slice(pos) }),
          ...state.lines.slice(lineIndex + 1),
        ],
      };
    })
    .addCase(drawingLineSetLines, (state, action) => ({
      ...state,
      lines: action.payload.filter(linefilter).map(withId),
    }))
    .addCase(
      drawingLineContinue,
      (state, { payload: { pointId, lineIndex } }) => {
        state.drawing = true;

        const { points } = state.lines[lineIndex];

        if (points[0]?.id === pointId) {
          reverse(points);
        }
      },
    )
    .addCase(mapsLoaded, (state, { payload }) => {
      const incoming = (payload.data.lines ?? initialState.lines).map(
        (line) => ({
          ...line,
          type:
            // compatibility
            (line.type as string) === 'area'
              ? 'polygon'
              : (line.type as string) === 'distance'
                ? 'line'
                : line.type,
        }),
      );

      // Installing a document must not change line identity. The same lines
      // arrive twice on a restore — from the URL first, so the map draws at
      // once, then from the document to reconcile with the backend — and
      // anything holding an id (the elevation chart names its line that way)
      // would lose its line if the second pass renumbered them.
      //
      // So each incoming line adopts an identical one already shown, keeping
      // its id *and* its object, and only a genuinely new line is allocated
      // one. Per line rather than all-or-nothing: a document that differs in
      // one line must not renumber the rest. Matched on the id-free content
      // string the my-maps dirty check already treats as a line's identity,
      // and consumed as it matches, so two identical lines stay two lines.
      const reusable = new Map<string, DrawnLine[]>();

      for (const line of payload.merge ? [] : state.lines) {
        const key = lineIdentity(line);

        const bucket = reusable.get(key);

        if (bucket) {
          bucket.push(line);
        } else {
          reusable.set(key, [line]);
        }
      }

      return {
        ...state,
        joinWith: undefined,
        drawing: false,
        lines: [
          ...(payload.merge ? state.lines : []),
          ...incoming.map(
            (line) => reusable.get(lineIdentity(line))?.shift() ?? withId(line),
          ),
        ],
      };
    })
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

      const line2 = state.lines[action.payload.lineIndex];

      if (line1.points[0]?.id === joinWith.pointId) {
        reverse(line1.points);
      }

      if (line2.points[0]?.id !== action.payload.pointId) {
        reverse(line2.points);
      }

      line1.label = [line1.label, line2.label].filter((l) => l).join(', ');

      const maxId = line1.points.reduce((a, b) => Math.max(a, b.id), -1) + 1;

      line1.points.push(
        ...line2.points.map((pt) => ({ ...pt, id: pt.id + maxId })),
      );

      state.lines.splice(action.payload.lineIndex, 1);

      state.joinWith = undefined;
    })
    // Reaching for another tool that takes map clicks ends the line being drawn,
    // as does closing the drawing tool. A toolbar-only tool opening beside it
    // takes no clicks, so the line survives it — and a "continue" resumes a line
    // without touching the tool at all, so that keeps appending points.
    .addMatcher(
      (action) =>
        (openTool.match(action) && isMapClickTool(action.payload)) ||
        (closeTool.match(action) && isDrawTool(action.payload)) ||
        drawingLineStopDrawing.match(action),
      (state) => ({
        ...state,
        drawing: false,
        joinWith: undefined,
      }),
    ),
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

  for (const [i, p] of points.entries()) {
    p.id = ids[i]!;
  }
}
