import type { Feature, LineString } from 'geojson';
import { describe, expect, it } from 'vitest';
import { colorizeByValues } from './types.js';

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
