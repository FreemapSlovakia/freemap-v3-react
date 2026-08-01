import { clearMapFeatures, setTool } from '@app/store/actions.js';
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

  it('goes with the tool that owns it, and stays for any other', () => {
    const state = shown({ type: 'track-viewer' });

    expect(elevationChartReducer(state, setTool('import-file')).target).toEqual(
      { type: 'track-viewer' },
    );

    for (const tool of ['objects', 'route-planner', null] as const) {
      expect(elevationChartReducer(state, setTool(tool)).target).toBeNull();
    }
  });

  it('outlives every tool when it charts a drawn line, which has no owning tool', () => {
    expect(
      elevationChartReducer(
        shown({ type: 'drawing', lineId: 1 }),
        setTool(null),
      ).target,
    ).toEqual({ type: 'drawing', lineId: 1 });
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
