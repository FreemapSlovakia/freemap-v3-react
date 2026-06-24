import type { Feature, LineString } from 'geojson';
import { describe, expect, it } from 'vitest';
import {
  type ColorizedPoint,
  colorizeByValues,
  noDataRuns,
  splitOnGaps,
} from './colorize.js';

function points(gaps: boolean[]): ColorizedPoint[] {
  return gaps.map((gap, lon) => ({ lat: 0, lon, color: 0, gap }));
}

function lons(runs: ColorizedPoint[][]): number[][] {
  return runs.map((run) => run.map((p) => p.lon));
}

function lineString(coords: number[][]): Feature<LineString> {
  return {
    type: 'Feature',
    properties: null,
    geometry: { type: 'LineString', coordinates: coords },
  };
}

describe('colorizeByValues', () => {
  it('normalizes finite values to 0..1 and flags NaN inputs as gaps', () => {
    const feature = lineString([
      [0, 0],
      [1, 0],
      [2, 0],
      [3, 0],
    ]);

    const [points] = colorizeByValues([feature], () => ({
      coords: feature.geometry.coordinates,
      values: [10, NaN, 30, 20],
    }));

    expect(points).toEqual([
      { lat: 0, lon: 0, color: 0, gap: false },
      { lat: 0, lon: 1, color: 0.5, gap: true },
      { lat: 0, lon: 2, color: 1, gap: false },
      { lat: 0, lon: 3, color: 0.5, gap: false },
    ]);
  });

  it('keeps a degenerate range at mid-palette without flagging gaps', () => {
    const feature = lineString([
      [0, 0],
      [1, 0],
    ]);

    const [points] = colorizeByValues([feature], () => ({
      coords: feature.geometry.coordinates,
      values: [5, 5],
    }));

    expect(points).toEqual([
      { lat: 0, lon: 0, color: 0.5, gap: false },
      { lat: 0, lon: 1, color: 0.5, gap: false },
    ]);
  });
});

describe('splitOnGaps / noDataRuns', () => {
  it('split colored runs around a gap and bridge it with a no-data run', () => {
    const pts = points([false, false, true, false, false]);

    expect(lons(splitOnGaps(pts))).toEqual([
      [0, 1],
      [3, 4],
    ]);

    // The no-data run includes the valid points bordering the gap so it
    // connects to the colored runs.
    expect(lons(noDataRuns(pts))).toEqual([[1, 2, 3]]);
  });

  it('covers every edge with exactly one of the two run sets', () => {
    const pts = points([false, true, true, false, false, true]);

    // Edges (i,i+1) covered by colored runs: only where both ends are valid.
    expect(lons(splitOnGaps(pts))).toEqual([[3, 4]]);

    // The complement: every edge touching a gap, including bordering points.
    expect(lons(noDataRuns(pts))).toEqual([
      [0, 1, 2, 3],
      [4, 5],
    ]);
  });

  it('drops isolated valid points (no run of either kind needs them alone)', () => {
    const pts = points([true, false, true]);

    expect(splitOnGaps(pts)).toEqual([]);

    // Both edges touch a gap, so the whole stretch is no-data.
    expect(lons(noDataRuns(pts))).toEqual([[0, 1, 2]]);
  });
});
