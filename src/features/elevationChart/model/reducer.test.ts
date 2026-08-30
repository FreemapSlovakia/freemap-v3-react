import { clearMapFeatures, closeTool, openTool } from '@app/store/actions.js';
import { describe, expect, it } from 'vitest';
import {
  elevationChartClose,
  elevationChartOpen,
  elevationChartSetElevationProfile,
  elevationChartSetRange,
} from './actions.js';
import {
  type ElevationChartState,
  type ElevationProfilePoint,
  elevationChartReducer,
} from './reducer.js';
import type { ElevationChartTarget } from './target.js';

const profile = elevationChartSetElevationProfile({
  points: [{ lat: 48, lon: 17, distance: 0, ele: 100 }],
  waypoints: [],
  sources: [],
  provenance: 'terrain-model',
});

// A chart aimed at `target` and already drawn.
const shown = (target: ElevationChartTarget): ElevationChartState =>
  [elevationChartOpen(target), profile].reduce<ElevationChartState | undefined>(
    elevationChartReducer,
    undefined,
  ) as ElevationChartState;

describe('elevationChartReducer', () => {
  it('aims the chart before any geometry is known', () => {
    const state = elevationChartReducer(
      undefined,
      elevationChartOpen({ type: 'route-planner' }),
    );

    expect(state.target).toEqual({ type: 'route-planner' });

    expect(state.elevationProfilePoints).toBeNull();
  });

  it('keeps the profile when re-aimed at what it already charts', () => {
    const state = elevationChartReducer(
      shown({ type: 'drawing', lineId: 7 }),
      elevationChartOpen({ type: 'drawing', lineId: 7 }),
    );

    expect(state.elevationProfilePoints).toHaveLength(1);
  });

  it('starts clean when aimed at another line of the same feature', () => {
    const state = elevationChartReducer(
      shown({ type: 'drawing', lineId: 7 }),
      elevationChartOpen({ type: 'drawing', lineId: 8 }),
    );

    expect(state.target).toEqual({ type: 'drawing', lineId: 8 });

    expect(state.elevationProfilePoints).toBeNull();
  });

  it('identifies a tracking target by device, not by position', () => {
    const state = elevationChartReducer(
      shown({ type: 'tracking', token: 'a' }),
      elevationChartOpen({ type: 'tracking', token: 'b' }),
    );

    expect(state.elevationProfilePoints).toBeNull();
  });

  it('goes when the tool that owns it is closed, and stays for any other', () => {
    const state = shown({ type: 'track-viewer' });

    expect(
      elevationChartReducer(state, closeTool('import-file')).target,
    ).toBeNull();

    for (const action of [
      closeTool('objects'),
      closeTool('route-planner'),
      openTool('import-file'),
    ]) {
      expect(elevationChartReducer(state, action).target).toEqual({
        type: 'track-viewer',
      });
    }
  });

  it('goes when another map-click tool takes the slot from the tool that owns it', () => {
    // Opening one closes the tool that had the slot, so its chart goes with it —
    // as it would on that tool's own close button.
    const state = shown({ type: 'route-planner' });

    expect(
      elevationChartReducer(state, openTool('draw-lines')).target,
    ).toBeNull();

    for (const action of [
      // The same tool reopened owns the chart still.
      openTool('route-planner'),
      // A toolbar-only tool takes no slot from anything.
      openTool('tracking'),
    ]) {
      expect(elevationChartReducer(state, action).target).toEqual({
        type: 'route-planner',
      });
    }
  });

  it('keeps a chart whose tool never held the map-click slot when one is opened', () => {
    expect(
      elevationChartReducer(
        shown({ type: 'tracking', token: 'tok-1' }),
        openTool('draw-lines'),
      ).target,
    ).toEqual({ type: 'tracking', token: 'tok-1' });
  });

  it('outlives every tool when it charts a drawn line, which has no owning tool', () => {
    for (const tool of ['import-file', 'route-planner', 'tracking'] as const) {
      expect(
        elevationChartReducer(
          shown({ type: 'drawing', lineId: 1 }),
          closeTool(tool),
        ).target,
      ).toEqual({ type: 'drawing', lineId: 1 });
    }
  });

  it('closes on close and on clearing the map', () => {
    for (const action of [elevationChartClose(), clearMapFeatures()]) {
      expect(
        elevationChartReducer(shown({ type: 'drawing', lineId: 1 }), action)
          .target,
      ).toBeNull();
    }
  });
});

// A stretch is asked for by URL as much as by hand, so it has to be kept to the
// profile it marks wherever it comes from — including before there is one.
describe('elevationChartReducer — the marked stretch', () => {
  const charted = (points: ElevationProfilePoint[]) =>
    elevationChartSetElevationProfile({
      points,
      waypoints: [],
      sources: [],
      provenance: 'terrain-model',
    });

  const kilometre: ElevationProfilePoint[] = [
    { lat: 48, lon: 17, distance: 0, ele: 100 },
    { lat: 48, lon: 17.1, distance: 1000, ele: 200 },
  ];

  const drawn = [
    elevationChartOpen({ type: 'route-planner' }),
    charted(kilometre),
  ].reduce<ElevationChartState | undefined>(
    elevationChartReducer,
    undefined,
  ) as ElevationChartState;

  it('keeps a stretch within the profile it marks', () => {
    expect(
      elevationChartReducer(
        drawn,
        elevationChartSetRange({ from: 500, to: 5000 }),
      ).range,
    ).toEqual({ from: 500, to: 1000 });
  });

  it('drops one that starts past the end, there being nothing left of it', () => {
    expect(
      elevationChartReducer(
        drawn,
        elevationChartSetRange({ from: 2000, to: 5000 }),
      ).range,
    ).toBeNull();
  });

  it('takes a stretch on trust while the profile is still coming', () => {
    // A URL names both at once; the profile arrives later and clamps it then.
    const aimed = elevationChartReducer(
      undefined,
      elevationChartOpen({ type: 'route-planner' }),
    );

    expect(
      elevationChartReducer(
        aimed,
        elevationChartSetRange({ from: 0, to: 5000 }),
      ).range,
    ).toEqual({ from: 0, to: 5000 });
  });

  it('trims a stretch the redrawn profile now ends before', () => {
    const marked = elevationChartReducer(
      drawn,
      elevationChartSetRange({ from: 100, to: 900 }),
    );

    const shortened = elevationChartReducer(
      marked,
      charted([kilometre[0]!, { ...kilometre[1]!, distance: 500 }]),
    );

    expect(shortened.range).toEqual({ from: 100, to: 500 });
  });

  it('leaves the stretch itself alone when a redraw does not move it', () => {
    // A live track dispatches a profile per fix; a new object each time would
    // redraw the map band and rescan the profile for its figures on every one.
    const marked = elevationChartReducer(
      drawn,
      elevationChartSetRange({ from: 100, to: 900 }),
    );

    expect(elevationChartReducer(marked, charted(kilometre)).range).toBe(
      marked.range,
    );
  });
});
