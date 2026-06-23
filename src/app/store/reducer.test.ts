import {
  selectFeature,
  setTool,
  setTools,
  type Tool,
  type ToolMode,
} from '@app/store/actions.js';
import { drawingLineStopDrawing } from '@features/drawing/model/actions/drawingLineActions.js';
import type { Action } from '@reduxjs/toolkit';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { type MainState, mainInitialState, mainReducer } from './reducer.js';

/**
 * The open-tools / active-tool state machine in the main reducer. Rules pinned
 * here: tools render in the order opened, the three draw-* tools share one slot,
 * only map-click tools can be the active (click-owning) one, a tool and a
 * feature selection are mutually exclusive, and `setTool`'s mode chooses between
 * opening passively, focusing, and closing.
 */

const run = (...actions: Action[]): MainState =>
  actions.reduce(mainReducer, mainInitialState);

const tool = (tool: Tool, mode: ToolMode) => setTool({ tool, mode });

const aLine = { type: 'draw-line-poly', id: 0 } as const;

beforeEach(() => {
  window.fmEmbedded = false;
});

afterEach(() => {
  window.fmEmbedded = false;
});

describe("setTool mode 'activate'", () => {
  it('opens a map-click tool and makes it active', () => {
    const s = run(tool('route-planner', 'activate'));

    expect(s.tools).toEqual(['route-planner']);
    expect(s.activeTool).toBe('route-planner');
  });

  it('appends newly opened tools in order and keeps an already-open one in place', () => {
    const s = run(
      tool('route-planner', 'activate'),
      tool('objects', 'activate'),
      tool('changesets', 'activate'),
      tool('route-planner', 'activate'),
    );

    expect(s.tools).toEqual(['route-planner', 'objects', 'changesets']);
  });

  it('never makes an overlay active and deactivates the current mode', () => {
    const s = run(
      tool('route-planner', 'activate'),
      tool('objects', 'activate'),
    );

    expect(s.tools).toEqual(['route-planner', 'objects']);
    expect(s.activeTool).toBe(null);
  });

  it('replaces the open draw tool in place (they share one menu)', () => {
    const s = run(
      tool('objects', 'activate'),
      tool('draw-points', 'activate'),
      tool('changesets', 'activate'),
      tool('draw-lines', 'activate'),
    );

    expect(s.tools).toEqual(['objects', 'draw-lines', 'changesets']);
    expect(s.activeTool).toBe('draw-lines');
  });

  it('clears the selection', () => {
    const s = run(selectFeature(aLine), tool('draw-lines', 'activate'));

    expect(s.selection).toBe(null);
  });

  it('re-activating an already-active tool keeps it active (no toggle)', () => {
    const s = run(
      tool('route-planner', 'activate'),
      tool('route-planner', 'activate'),
    );

    expect(s.activeTool).toBe('route-planner');
  });

  it('does nothing while embedded', () => {
    window.fmEmbedded = true;

    expect(run(tool('route-planner', 'activate')).tools).toEqual([]);
  });
});

describe("setTool mode 'open'", () => {
  it('opens a toolbar without activating it or clearing the selection', () => {
    const s = run(selectFeature(aLine), tool('objects', 'open'));

    expect(s.tools).toEqual(['objects']);
    expect(s.activeTool).toBe(null);
    expect(s.selection).toEqual(aLine);
  });

  it('leaves another mode active when a different tool is opened', () => {
    const s = run(tool('route-planner', 'activate'), tool('objects', 'open'));

    expect(s.tools).toEqual(['route-planner', 'objects']);
    expect(s.activeTool).toBe('route-planner');
  });

  it('deactivates the active tool when it is the one opened (toggle off)', () => {
    const s = run(
      tool('route-planner', 'activate'),
      tool('route-planner', 'open'),
    );

    expect(s.tools).toEqual(['route-planner']);
    expect(s.activeTool).toBe(null);
  });
});

describe("setTool mode 'close'", () => {
  it('drops the active tool when it is the one closed', () => {
    const open = run(
      tool('objects', 'activate'),
      tool('route-planner', 'activate'),
    );

    const s = mainReducer(open, tool('route-planner', 'close'));

    expect(s.tools).toEqual(['objects']);
    expect(s.activeTool).toBe(null);
  });

  it('keeps the active tool when a different tool is closed', () => {
    const open = run(
      tool('objects', 'activate'),
      tool('route-planner', 'activate'),
    );

    const s = mainReducer(open, tool('objects', 'close'));

    expect(s.tools).toEqual(['route-planner']);
    expect(s.activeTool).toBe('route-planner');
  });
});

describe('setTools (restore)', () => {
  it('dedupes draw tools and focuses the last open map-click tool', () => {
    const s = run(
      setTools([
        'draw-points',
        'objects',
        'draw-lines',
        'route-planner',
        'changesets',
      ]),
    );

    expect(s.tools).toEqual([
      'draw-points',
      'objects',
      'route-planner',
      'changesets',
    ]);
    expect(s.activeTool).toBe('route-planner');
  });

  it('setTools([]) closes everything', () => {
    const s = run(
      tool('route-planner', 'activate'),
      tool('objects', 'activate'),
      setTools([]),
    );

    expect(s.tools).toEqual([]);
    expect(s.activeTool).toBe(null);
  });
});

describe('tool / selection mutual exclusivity', () => {
  it('selecting a feature deactivates the active tool but keeps it open', () => {
    const open = run(tool('route-planner', 'activate'));

    const s = mainReducer(open, selectFeature(aLine));

    expect(s.selection).toEqual(aLine);
    expect(s.activeTool).toBe(null);
    expect(s.tools).toEqual(['route-planner']);
  });
});

describe('drawingLineStopDrawing', () => {
  it('closes the drawing tool and clears its active state', () => {
    const open = run(
      tool('objects', 'activate'),
      tool('draw-lines', 'activate'),
    );

    const s = mainReducer(open, drawingLineStopDrawing());

    expect(s.tools).toEqual(['objects']);
    expect(s.activeTool).toBe(null);
  });
});
