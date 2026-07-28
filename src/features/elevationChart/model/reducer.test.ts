import { clearMapFeatures, setTool, setTools } from '@app/store/actions.js';
import { describe, expect, it } from 'vitest';
import {
  elevationChartClose,
  elevationChartOpen,
  elevationChartSetElevationProfile,
} from './actions.js';
import { type ElevationChartState, elevationChartReducer } from './reducer.js';
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

  it('closes with the tool that owns it, and only that one', () => {
    const state = shown({ type: 'track-viewer' });

    for (const tool of ['objects', 'route-planner'] as const) {
      expect(
        elevationChartReducer(state, setTool({ tool, mode: 'close' })).target,
      ).toEqual({ type: 'track-viewer' });
    }

    expect(
      elevationChartReducer(
        state,
        setTool({ tool: 'import-file', mode: 'close' }),
      ).target,
    ).toBeNull();
  });

  it('closes on close, on clearing the map and when all tools go', () => {
    for (const action of [
      elevationChartClose(),
      clearMapFeatures(),
      setTools([]),
    ]) {
      expect(
        elevationChartReducer(shown({ type: 'drawing', lineId: 1 }), action)
          .target,
      ).toBeNull();
    }
  });
});
