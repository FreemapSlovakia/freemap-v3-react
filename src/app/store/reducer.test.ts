import {
  closeTool,
  convertToDrawing,
  openTool,
  selectFeature,
} from '@app/store/actions.js';
import { drawingLineStopDrawing } from '@features/drawing/model/actions/drawingLineActions.js';
import {
  type SearchResult,
  searchSelectResult,
  searchUnselectResult,
} from '@features/search/model/actions.js';
import type { Action } from '@reduxjs/toolkit';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { type MainState, mainInitialState, mainReducer } from './reducer.js';

/**
 * The open-tool state machine in the main reducer. Rules pinned here: at most
 * one map-click tool is open and opening another replaces it, toolbar-only
 * tools accumulate, and taking the map-click slot from another tool drops the
 * selection unless the tool opened is the one the selected feature belongs to.
 */

const run = (...actions: Action[]): MainState =>
  actions.reduce(mainReducer, mainInitialState);

const aLine = { type: 'draw-line-poly', id: 0 } as const;

const aResult = {
  id: { type: 'osm', elementType: 'node', id: 1 },
} as SearchResult;

const anotherResult = {
  id: { type: 'osm', elementType: 'way', id: 2 },
} as SearchResult;

beforeEach(() => {
  window.fmEmbedded = false;
});

afterEach(() => {
  window.fmEmbedded = false;
});

describe('openTool', () => {
  it('opens a map-click tool into the map-click slot', () => {
    const s = run(openTool('route-planner'));

    expect(s.mapTool).toBe('route-planner');
    expect(s.panelTools).toEqual([]);
  });

  it('opens a toolbar-only tool beside the map-click one', () => {
    const s = run(openTool('route-planner'), openTool('objects'));

    expect(s.mapTool).toBe('route-planner');
    expect(s.panelTools).toEqual(['objects']);
  });

  it('keeps toolbar-only tools open alongside each other, in the order opened', () => {
    const s = run(
      openTool('objects'),
      openTool('tracking'),
      openTool('import-file'),
    );

    expect(s.panelTools).toEqual(['objects', 'tracking', 'import-file']);
  });

  it('replaces the open map-click tool — only one of them owns the clicks', () => {
    const s = run(openTool('route-planner'), openTool('draw-points'));

    expect(s.mapTool).toBe('draw-points');
  });

  it('opens an already open tool only once', () => {
    const s = run(openTool('objects'), openTool('objects'));

    expect(s.panelTools).toEqual(['objects']);
  });

  it('does nothing while embedded', () => {
    window.fmEmbedded = true;

    const s = run(openTool('route-planner'), openTool('objects'));

    expect(s.mapTool).toBe(null);
    expect(s.panelTools).toEqual([]);
  });
});

describe('closeTool', () => {
  it('closes the named map-click tool', () => {
    const s = run(openTool('route-planner'), closeTool('route-planner'));

    expect(s.mapTool).toBe(null);
  });

  it('closes the named toolbar-only tool and leaves the others open', () => {
    const s = run(
      openTool('objects'),
      openTool('tracking'),
      closeTool('objects'),
    );

    expect(s.panelTools).toEqual(['tracking']);
  });

  it('leaves the map-click tool alone when a panel is closed', () => {
    const s = run(
      openTool('draw-lines'),
      openTool('tracking'),
      closeTool('tracking'),
    );

    expect(s.mapTool).toBe('draw-lines');
  });
});

describe('openTool and the selection', () => {
  it('drops the selection when an unrelated tool takes the map-click slot', () => {
    const s = run(selectFeature(aLine), openTool('route-planner'));

    expect(s.selection).toBe(null);
  });

  it('keeps the selection for the tool the feature belongs to', () => {
    for (const tool of ['draw-lines', 'draw-polygons'] as const) {
      const s = run(selectFeature(aLine), openTool(tool));

      expect(s.selection).toEqual(aLine);
    }
  });

  it('keeps the selection when a toolbar-only tool is opened', () => {
    // Opening one is no mode change — it takes no clicks off the map.
    const s = run(selectFeature(aLine), openTool('tracking'));

    expect(s.selection).toEqual(aLine);
  });

  it('keeps the selection when a tool is closed', () => {
    const s = run(
      openTool('objects'),
      selectFeature(aLine),
      closeTool('objects'),
    );

    expect(s.selection).toEqual(aLine);
  });

  it('keeps the selection when the open map-click tool is reopened', () => {
    const s = run(
      openTool('draw-lines'),
      selectFeature(aLine),
      openTool('draw-lines'),
    );

    expect(s.selection).toEqual(aLine);
  });
});

describe('selecting a feature', () => {
  it('leaves the open tool alone', () => {
    const s = run(openTool('route-planner'), selectFeature(aLine));

    expect(s.selection).toEqual(aLine);
    expect(s.mapTool).toBe('route-planner');
  });

  it('keeps the tool open when a search result is selected', () => {
    // The selection toolbar renders alongside the tool's own toolbar.
    const s = run(
      openTool('map-details'),
      searchSelectResult({ result: aResult }),
    );

    expect(s.selection).toEqual({ type: 'search', id: aResult.id });
    expect(s.mapTool).toBe('map-details');
  });

  it('clearing the result leaves the selection to whoever cleared it', () => {
    const s = run(
      searchSelectResult({ result: aResult }),
      selectFeature(null),
      searchSelectResult(null),
    );

    expect(s.selection).toBeNull();
  });

  it('the last result picked is the one acted upon', () => {
    const s = run(
      searchSelectResult({ result: aResult }),
      searchSelectResult({ result: anotherResult }),
    );

    expect(s.selection).toEqual({ type: 'search', id: anotherResult.id });
  });

  it('taking the acted-upon result off the map deselects it', () => {
    const s = run(
      searchSelectResult({ result: aResult }),
      searchUnselectResult(aResult.id),
    );

    expect(s.selection).toBeNull();
  });

  it('leaves the selection alone when another shown result goes', () => {
    const s = run(
      searchSelectResult({ result: aResult }),
      searchUnselectResult(anotherResult.id),
    );

    expect(s.selection).toEqual({ type: 'search', id: aResult.id });
  });
});

describe('convertToDrawing', () => {
  it('closes the tool the conversion was reached for from', () => {
    const s = run(
      openTool('objects'),
      openTool('tracking'),
      convertToDrawing({ type: 'objects' }),
    );

    expect(s.panelTools).toEqual(['tracking']);
  });

  it('leaves the tools alone when converting from a selection toolbar', () => {
    const s = run(
      openTool('objects'),
      convertToDrawing({ type: 'search-result' }),
    );

    expect(s.panelTools).toEqual(['objects']);
  });
});

describe('drawingLineStopDrawing', () => {
  it('keeps the draw tool open — stopping only clears the drawing flag in the drawingLines slice', () => {
    const s = run(openTool('draw-lines'), drawingLineStopDrawing());

    expect(s.mapTool).toBe('draw-lines');
  });
});
