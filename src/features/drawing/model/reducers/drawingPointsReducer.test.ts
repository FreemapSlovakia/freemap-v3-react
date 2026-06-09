import { applySettings, clearMapFeatures } from '@app/store/actions.js';
import { describe, expect, it } from 'vitest';
import type { DrawingPoint } from '../actions/drawingPointActions.js';
import {
  drawingPointAdd,
  drawingPointChangePosition,
  drawingPointChangeProperties,
  drawingPointDelete,
  drawingPointSetAll,
} from '../actions/drawingPointActions.js';
import {
  type DrawingPointsState,
  drawingPointsReducer,
} from './drawingPointsReducer.js';

/** Pure reducer tests for the drawing-points slice. */

const initial: DrawingPointsState = { points: [], change: 0 };

const point = (
  lat: number,
  lon: number,
  extra?: Partial<DrawingPoint>,
): DrawingPoint => ({ coords: { lat, lon }, ...extra });

describe('drawingPointsReducer', () => {
  it('add appends a point and bumps the change counter', () => {
    const next = drawingPointsReducer(
      initial,
      drawingPointAdd({ ...point(1, 2), id: 1 }),
    );

    expect(next.points).toHaveLength(1);
    expect(next.points[0]).toMatchObject({ coords: { lat: 1, lon: 2 } });
    expect(next.change).toBe(1);
  });

  it('delete removes the point at the index', () => {
    const state = {
      points: [point(0, 0), point(1, 1), point(2, 2)],
      change: 0,
    };

    const next = drawingPointsReducer(state, drawingPointDelete({ index: 1 }));

    expect(next.points.map((p) => p.coords.lat)).toEqual([0, 2]);
  });

  it('changePosition updates only the targeted point coords', () => {
    const state = { points: [point(0, 0), point(1, 1)], change: 0 };

    const next = drawingPointsReducer(
      state,
      drawingPointChangePosition({ index: 1, coords: { lat: 9, lon: 9 } }),
    );

    expect(next.points[1].coords).toEqual({ lat: 9, lon: 9 });
    expect(next.points[0].coords).toEqual({ lat: 0, lon: 0 });
  });

  it('changeProperties merges properties into the targeted point', () => {
    const state = { points: [point(0, 0, { label: 'old' })], change: 0 };

    const next = drawingPointsReducer(
      state,
      drawingPointChangeProperties({
        index: 0,
        properties: {
          label: 'new',
          color: '#f00',
          markerType: undefined,
          icon: undefined,
        },
      }),
    );

    expect(next.points[0]).toMatchObject({ label: 'new', color: '#f00' });
    expect(next.points[0].coords).toEqual({ lat: 0, lon: 0 });
  });

  it('setAll replaces the whole point array', () => {
    const state = { points: [point(0, 0)], change: 5 };

    const next = drawingPointsReducer(
      state,
      drawingPointSetAll([point(1, 1), point(2, 2)]),
    );

    expect(next.points.map((p) => p.coords.lat)).toEqual([1, 2]);
    expect(next.change).toBe(5); // setAll leaves the change counter alone
  });

  it('clearMapFeatures resets to the initial state', () => {
    const state = { points: [point(0, 0)], change: 3 };

    const next = drawingPointsReducer(state, clearMapFeatures());

    expect(next).toEqual(initial);
  });

  it('applySettings with drawingApplyAll assigns drawing props to every point', () => {
    const state = {
      points: [point(0, 0, { color: '#000' }), point(1, 1)],
      change: 0,
    };

    const next = drawingPointsReducer(
      state,
      applySettings({ drawingApplyAll: true, drawing: { color: '#0f0' } }),
    );

    expect(next.points.every((p) => p.color === '#0f0')).toBe(true);
  });

  it('applySettings without drawingApplyAll leaves points untouched', () => {
    const state = { points: [point(0, 0, { color: '#000' })], change: 0 };

    const next = drawingPointsReducer(
      state,
      applySettings({ drawing: { color: '#0f0' } }),
    );

    expect(next.points[0].color).toBe('#000');
  });
});
