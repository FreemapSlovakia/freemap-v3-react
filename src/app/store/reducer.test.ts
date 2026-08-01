import { selectFeature, setTool } from '@app/store/actions.js';
import { drawingLineStopDrawing } from '@features/drawing/model/actions/drawingLineActions.js';
import {
  type SearchResult,
  searchSelectResult,
} from '@features/search/model/actions.js';
import type { Action } from '@reduxjs/toolkit';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { type MainState, mainInitialState, mainReducer } from './reducer.js';

/**
 * The open-tool state machine in the main reducer. Rules pinned here: exactly
 * one tool is open at a time, `setTool(null)` closes it, and switching tools
 * drops the selection unless the tool opened is the one the selected feature
 * belongs to.
 */

const run = (...actions: Action[]): MainState =>
  actions.reduce(mainReducer, mainInitialState);

const aLine = { type: 'draw-line-poly', id: 0 } as const;

beforeEach(() => {
  window.fmEmbedded = false;
});

afterEach(() => {
  window.fmEmbedded = false;
});

describe('setTool', () => {
  it('opens a tool', () => {
    expect(run(setTool('route-planner')).tool).toBe('route-planner');
  });

  it('replaces the open tool — only one is ever open', () => {
    const s = run(setTool('route-planner'), setTool('objects'));

    expect(s.tool).toBe('objects');
  });

  it('closes the open tool on null', () => {
    expect(run(setTool('route-planner'), setTool(null)).tool).toBe(null);
  });

  it('does nothing while embedded', () => {
    window.fmEmbedded = true;

    expect(run(setTool('route-planner')).tool).toBe(null);
  });
});

describe('setTool and the selection', () => {
  it('drops the selection when switching to an unrelated tool', () => {
    const s = run(selectFeature(aLine), setTool('route-planner'));

    expect(s.selection).toBe(null);
  });

  it('keeps the selection for the tool the feature belongs to', () => {
    for (const tool of ['draw-lines', 'draw-polygons'] as const) {
      const s = run(selectFeature(aLine), setTool(tool));

      expect(s.selection).toEqual(aLine);
    }
  });

  it('keeps the selection when the tool is closed', () => {
    const s = run(setTool('objects'), selectFeature(aLine), setTool(null));

    expect(s.selection).toEqual(aLine);
  });

  it('keeps the selection when the open tool is reopened', () => {
    const s = run(setTool('objects'), selectFeature(aLine), setTool('objects'));

    expect(s.selection).toEqual(aLine);
  });
});

describe('selecting a feature', () => {
  it('leaves the open tool alone', () => {
    const s = run(setTool('route-planner'), selectFeature(aLine));

    expect(s.selection).toEqual(aLine);
    expect(s.tool).toBe('route-planner');
  });

  it('keeps the tool open when a search result is selected', () => {
    // The selection toolbar renders alongside the tool's own toolbar.
    const s = run(
      setTool('map-details'),
      searchSelectResult({ result: {} as SearchResult }),
    );

    expect(s.selection).toEqual({ type: 'search' });
    expect(s.tool).toBe('map-details');
  });
});

describe('drawingLineStopDrawing', () => {
  it('keeps the draw tool open — stopping only clears the drawing flag in the drawingLines slice', () => {
    const s = run(setTool('draw-lines'), drawingLineStopDrawing());

    expect(s.tool).toBe('draw-lines');
  });
});
