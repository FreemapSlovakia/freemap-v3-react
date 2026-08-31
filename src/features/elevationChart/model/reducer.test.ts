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

  // What the chart draws outlives the panel that made it: a route stays on the
  // map once its finder is closed, an imported track once the viewer is, and a
  // link can ask for the profile with no tool open at all. Only the line itself
  // going takes the chart, and that is the resolver's to report.
  it('outlives every tool, whatever it charts', () => {
    const targets: ElevationChartTarget[] = [
      { type: 'route-planner' },
      { type: 'track-viewer' },
      { type: 'drawing', lineId: 1 },
      { type: 'tracking', token: 'tok-1' },
    ];

    for (const target of targets) {
      const state = shown(target);

      for (const action of [
        // Its own tool closing.
        closeTool('import-file'),
        closeTool('route-planner'),
        closeTool('tracking'),
        // Another map-click tool taking the slot from it.
        openTool('draw-lines'),
        openTool('route-planner'),
      ]) {
        expect(elevationChartReducer(state, action).target).toEqual(target);
      }
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
