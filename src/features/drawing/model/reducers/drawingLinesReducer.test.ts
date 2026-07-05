import {
  clearMapFeatures,
  selectFeature,
  setTool,
} from '@app/store/actions.js';
import { describe, expect, it } from 'vitest';
import {
  drawingLineAdd,
  drawingLineAddPoint,
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
import {
  type DrawingLinesState,
  drawingLinesReducer,
  initialState,
} from './drawingLinesReducer.js';

/**
 * Pure reducer tests for the drawing-lines slice. Points carry an explicit
 * `id`; several actions (reverse, join, continue) preserve those ids in place
 * while reordering the array, which is the subtle behavior pinned here.
 */

const p = (id: number, lat = id, lon = id): Point => ({ id, lat, lon });

const line = (
  type: Line['type'],
  points: Point[],
  extra?: Partial<Line>,
): Line => ({
  type,
  points,
  ...extra,
});

const withLines = (lines: Line[]): DrawingLinesState => ({
  ...initialState,
  lines,
});

// The reducer ignores `selection`; supply a valid one to satisfy the payload.
const joinFinish = (lineIndex: number, pointId: number) =>
  drawingLineJoinFinish({
    lineIndex,
    pointId,
    selection: { type: 'draw-line-poly', id: 0 },
  });

describe('drawingLinesReducer — basic CRUD', () => {
  it('add appends a line', () => {
    const l = line('line', [p(0), p(1)]);

    const next = drawingLinesReducer(initialState, drawingLineAdd(l));

    expect(next.lines).toEqual([l]);
  });

  it('delete removes the line at lineIndex', () => {
    const state = withLines([line('line', [p(0)]), line('line', [p(1)])]);

    const next = drawingLinesReducer(
      state,
      drawingLineDelete({ lineIndex: 0 }),
    );

    expect(next.lines).toHaveLength(1);
    expect(next.lines[0].points[0].id).toBe(1);
  });

  it('deletePoint removes a point by id within a line', () => {
    const state = withLines([line('line', [p(0), p(1), p(2)])]);

    const next = drawingLinesReducer(
      state,
      drawingLineDeletePoint({ lineIndex: 0, pointId: 1 }),
    );

    expect(next.lines[0].points.map((pt) => pt.id)).toEqual([0, 2]);
  });

  it('removePoint removes a point by id', () => {
    const state = withLines([line('line', [p(0), p(1), p(2)])]);

    const next = drawingLinesReducer(
      state,
      drawingLineRemovePoint({ index: 0, id: 2 }),
    );

    expect(next.lines[0].points.map((pt) => pt.id)).toEqual([0, 1]);
  });

  it('updatePoint merges new coords into the matching point', () => {
    const state = withLines([line('line', [p(0), p(1)])]);

    const next = drawingLinesReducer(
      state,
      drawingLineUpdatePoint({ index: 0, point: { id: 1, lat: 9, lon: 8 } }),
    );

    expect(next.lines[0].points[1]).toEqual({ id: 1, lat: 9, lon: 8 });
    expect(next.lines[0].points[0]).toEqual({ id: 0, lat: 0, lon: 0 });
  });
});

describe('drawingLinesReducer — reverse (id-preserving)', () => {
  it('reverses coordinates while keeping ids in their original positions', () => {
    const state = withLines([
      line('line', [
        { id: 10, lat: 0, lon: 0 },
        { id: 11, lat: 1, lon: 1 },
        { id: 12, lat: 2, lon: 2 },
      ]),
    ]);

    const next = drawingLinesReducer(
      state,
      drawingLineReverse({ lineIndex: 0 }),
    );

    // Ids stay 10/11/12 in order; the coordinates are what got reversed.
    expect(next.lines[0].points.map((pt) => pt.id)).toEqual([10, 11, 12]);
    expect(next.lines[0].points.map((pt) => pt.lat)).toEqual([2, 1, 0]);
  });
});

describe('drawingLinesReducer — split', () => {
  it('splits a line at a point into two lines sharing that point', () => {
    const state = withLines([line('line', [p(0), p(1), p(2), p(3)])]);

    const next = drawingLinesReducer(
      state,
      drawingLineSplit({ lineIndex: 0, pointId: 1 }),
    );

    expect(next.lines).toHaveLength(2);
    // First piece includes the split point; second piece starts from it.
    expect(next.lines[0].points.map((pt) => pt.id)).toEqual([0, 1]);
    expect(next.lines[1].points.map((pt) => pt.id)).toEqual([1, 2, 3]);
  });
});

describe('drawingLinesReducer — join', () => {
  it('joins the start-flagged line onto another, offsetting the second line ids', () => {
    const state: DrawingLinesState = {
      ...initialState,
      joinWith: { lineIndex: 0, pointId: 2 },
      lines: [
        line('line', [p(0), p(1), p(2)], { label: 'A' }),
        line('line', [p(0), p(1)], { label: 'B' }),
      ],
    };

    const next = drawingLinesReducer(state, joinFinish(1, 0));

    // Lines merged into one; the join cursor is cleared.
    expect(next.lines).toHaveLength(1);
    expect(next.joinWith).toBeUndefined();
    // Labels concatenated.
    expect(next.lines[0].label).toBe('A, B');
    // Second line's ids are shifted past the first line's max id (2) + 1 = 3.
    expect(next.lines[0].points.map((pt) => pt.id)).toEqual([0, 1, 2, 3, 4]);
  });

  it('joinFinish is a no-op when nothing is flagged for joining', () => {
    const state = withLines([line('line', [p(0), p(1)])]);

    const next = drawingLinesReducer(state, joinFinish(0, 0));

    expect(next.lines).toHaveLength(1);
  });

  it('joinStart stores the join cursor', () => {
    const next = drawingLinesReducer(
      initialState,
      drawingLineJoinStart({ lineIndex: 1, pointId: 5 }),
    );

    expect(next.joinWith).toEqual({ lineIndex: 1, pointId: 5 });
  });
});

describe('drawingLinesReducer — simplify', () => {
  it('leaves lines with fewer than 3 points untouched', () => {
    const state = withLines([line('line', [p(0), p(1)])]);

    const next = drawingLinesReducer(
      state,
      drawingLineSimplify({ lineIndex: 0, tolerance: 1 }),
    );

    expect(next.lines[0].points).toHaveLength(2);
  });

  it('drops a near-collinear midpoint and reindexes ids', () => {
    const state = withLines([
      line('line', [
        { id: 0, lat: 0, lon: 0 },
        { id: 1, lat: 0, lon: 1 }, // collinear midpoint
        { id: 2, lat: 0, lon: 2 },
      ]),
    ]);

    const next = drawingLinesReducer(
      state,
      drawingLineSimplify({ lineIndex: 0, tolerance: 1 }),
    );

    expect(next.lines[0].points.map((pt) => pt.id)).toEqual([0, 1]);
    expect(next.lines[0].points.map((pt) => [pt.lat, pt.lon])).toEqual([
      [0, 0],
      [0, 2],
    ]);
  });
});

describe('drawingLinesReducer — continue & drawing flag', () => {
  it('continue from the first point reverses so drawing extends the tail', () => {
    const state = withLines([
      line('line', [
        { id: 0, lat: 0, lon: 0 },
        { id: 1, lat: 1, lon: 1 },
      ]),
    ]);

    const next = drawingLinesReducer(
      state,
      drawingLineContinue({ lineIndex: 0, pointId: 0 }),
    );

    expect(next.drawing).toBe(true);
    expect(next.lines[0].points.map((pt) => pt.lat)).toEqual([1, 0]);
  });

  it('continue from the last point keeps order', () => {
    const state = withLines([
      line('line', [
        { id: 0, lat: 0, lon: 0 },
        { id: 1, lat: 1, lon: 1 },
      ]),
    ]);

    const next = drawingLinesReducer(
      state,
      drawingLineContinue({ lineIndex: 0, pointId: 1 }),
    );

    expect(next.lines[0].points.map((pt) => pt.lat)).toEqual([0, 1]);
  });

  it('stopDrawing / activating a tool clear the drawing + join state', () => {
    const state: DrawingLinesState = {
      drawing: true,
      joinWith: { lineIndex: 0, pointId: 1 },
      lines: [],
    };

    for (const action of [
      drawingLineStopDrawing(),
      setTool({ tool: 'draw-lines', mode: 'activate' }),
    ]) {
      const next = drawingLinesReducer(state, action);

      expect(next.drawing).toBe(false);
      expect(next.joinWith).toBeUndefined();
    }
  });

  it('addPoint with drawing:true enters drawing mode (interactive map click)', () => {
    const next = drawingLinesReducer(
      initialState,
      drawingLineAddPoint({
        lineProps: { type: 'line' },
        point: p(0),
        indexOfLineToSelect: 0,
        drawing: true,
      }),
    );

    expect(next.drawing).toBe(true);
    expect(next.lines[0].points.map((pt) => pt.id)).toEqual([0]);
  });

  it('addPoint without drawing leaves the flag untouched (projection / midpoint / context-menu)', () => {
    const state = withLines([line('line', [p(0), p(1)])]);

    const next = drawingLinesReducer(
      state,
      drawingLineAddPoint({
        lineIndex: 0,
        point: p(2),
        indexOfLineToSelect: 0,
      }),
    );

    expect(next.drawing).toBe(false);
  });

  it('deactivating or closing the draw tool keeps the in-progress drawing', () => {
    const state: DrawingLinesState = {
      drawing: true,
      joinWith: { lineIndex: 0, pointId: 1 },
      lines: [],
    };

    for (const mode of ['open', 'close'] as const) {
      const next = drawingLinesReducer(
        state,
        setTool({ tool: 'draw-lines', mode }),
      );

      // Drawing survives; only the transient join cursor is dropped.
      expect(next.drawing).toBe(true);
      expect(next.joinWith).toBeUndefined();
    }
  });
});

describe('drawingLinesReducer — linefilter (selectFeature / setLines)', () => {
  it('selectFeature drops degenerate lines and polygons', () => {
    const state = withLines([
      line('line', [p(0), p(1)]), // valid line (>1 point)
      line('line', [p(0)]), // degenerate line
      line('polygon', [p(0), p(1), p(2)]), // valid polygon (>2 points)
      line('polygon', [p(0), p(1)]), // degenerate polygon
    ]);

    const next = drawingLinesReducer(state, selectFeature(null));

    expect(next.lines.map((l) => [l.type, l.points.length])).toEqual([
      ['line', 2],
      ['polygon', 3],
    ]);
    expect(next.drawing).toBe(false);
  });

  it('setLines applies the same degeneracy filter', () => {
    const next = drawingLinesReducer(
      initialState,
      drawingLineSetLines([line('line', [p(0)]), line('line', [p(0), p(1)])]),
    );

    expect(next.lines).toHaveLength(1);
  });

  it('clearMapFeatures resets to the initial state', () => {
    const state = withLines([line('line', [p(0), p(1)])]);

    expect(drawingLinesReducer(state, clearMapFeatures())).toEqual(
      initialState,
    );
  });
});
