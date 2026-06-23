import {
  activateTool,
  closeTool,
  selectFeature,
  setTool,
  setTools,
} from '@app/store/actions.js';
import { drawingLineStopDrawing } from '@features/drawing/model/actions/drawingLineActions.js';
import type { Action } from '@reduxjs/toolkit';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { type MainState, mainInitialState, mainReducer } from './reducer.js';

/**
 * The open-tools / active-tool state machine in the main reducer. Rules pinned
 * here: tools render in the order opened, the three draw-* tools share one slot,
 * only map-click tools can be the active (click-owning) one, and a tool and a
 * feature selection are mutually exclusive.
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
  it('opens a map-click tool and makes it active', () => {
    const s = run(setTool('route-planner'));

    expect(s.tools).toEqual(['route-planner']);
    expect(s.activeTool).toBe('route-planner');
  });

  it('appends newly opened tools in order and keeps an already-open one in place', () => {
    const s = run(
      setTool('route-planner'),
      setTool('objects'),
      setTool('changesets'),
      setTool('route-planner'),
    );

    expect(s.tools).toEqual(['route-planner', 'objects', 'changesets']);
  });

  it('never makes an overlay active and deactivates the current mode', () => {
    const s = run(setTool('route-planner'), setTool('objects'));

    expect(s.tools).toEqual(['route-planner', 'objects']);
    expect(s.activeTool).toBe(null);
  });

  it('replaces the open draw tool in place (they share one menu)', () => {
    const s = run(
      setTool('objects'),
      setTool('draw-points'),
      setTool('changesets'),
      setTool('draw-lines'),
    );

    expect(s.tools).toEqual(['objects', 'draw-lines', 'changesets']);
    expect(s.activeTool).toBe('draw-lines');
  });

  it('setTool(null) closes everything', () => {
    const s = run(setTool('route-planner'), setTool('objects'), setTool(null));

    expect(s.tools).toEqual([]);
    expect(s.activeTool).toBe(null);
  });

  it('opening a tool clears the selection', () => {
    const s = run(selectFeature(aLine), setTool('draw-lines'));

    expect(s.selection).toBe(null);
  });

  it('does nothing while embedded', () => {
    window.fmEmbedded = true;

    expect(run(setTool('route-planner')).tools).toEqual([]);
  });
});

describe('activateTool', () => {
  it('toggles focus of an open map-click tool', () => {
    const open = run(setTool('route-planner'), setTool('objects')); // active === null

    const focused = mainReducer(open, activateTool('route-planner'));

    expect(focused.activeTool).toBe('route-planner');

    expect(mainReducer(focused, activateTool('route-planner')).activeTool).toBe(
      null,
    );
  });

  it('ignores overlays', () => {
    const open = run(setTool('changesets'));

    expect(mainReducer(open, activateTool('changesets')).activeTool).toBe(null);
  });

  it('clears the selection when focusing a tool', () => {
    const withSel = run(
      setTool('route-planner'),
      setTool('objects'),
      selectFeature(aLine),
    );

    const s = mainReducer(withSel, activateTool('route-planner'));

    expect(s.activeTool).toBe('route-planner');
    expect(s.selection).toBe(null);
  });
});

describe('closeTool', () => {
  it('drops the active tool when it is the one closed', () => {
    const open = run(setTool('objects'), setTool('route-planner'));

    const s = mainReducer(open, closeTool('route-planner'));

    expect(s.tools).toEqual(['objects']);
    expect(s.activeTool).toBe(null);
  });

  it('keeps the active tool when a different tool is closed', () => {
    const open = run(setTool('objects'), setTool('route-planner'));

    const s = mainReducer(open, closeTool('objects'));

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
});

describe('tool / selection mutual exclusivity', () => {
  it('selecting a feature deactivates the active tool but keeps it open', () => {
    const open = run(setTool('route-planner'));

    const s = mainReducer(open, selectFeature(aLine));

    expect(s.selection).toEqual(aLine);
    expect(s.activeTool).toBe(null);
    expect(s.tools).toEqual(['route-planner']);
  });
});

describe('drawingLineStopDrawing', () => {
  it('closes the drawing tool and clears its active state', () => {
    const open = run(setTool('objects'), setTool('draw-lines'));

    const s = mainReducer(open, drawingLineStopDrawing());

    expect(s.tools).toEqual(['objects']);
    expect(s.activeTool).toBe(null);
  });
});
