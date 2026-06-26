import type { Feature, FeatureCollection } from 'geojson';
import { describe, expect, it } from 'vitest';
import { resolveActiveTrack, trackLineFeatures } from './trackSelection.js';

const point: Feature = {
  type: 'Feature',
  properties: {},
  geometry: { type: 'Point', coordinates: [0, 0] },
};

const line = (id: string): Feature => ({
  type: 'Feature',
  properties: { name: id },
  geometry: {
    type: 'LineString',
    coordinates: [
      [0, 0],
      [1, 1],
    ],
  },
});

const fc = (features: Feature[]): FeatureCollection => ({
  type: 'FeatureCollection',
  features,
});

describe('trackLineFeatures', () => {
  it('returns only line-like features with their collection index', () => {
    const result = trackLineFeatures(fc([point, line('a'), point, line('b')]));

    expect(result.map((r) => r.index)).toEqual([1, 3]);
    expect(result.map((r) => r.feature.properties?.['name'])).toEqual([
      'a',
      'b',
    ]);
  });

  it('is empty for null or line-less collections', () => {
    expect(trackLineFeatures(null)).toEqual([]);
    expect(trackLineFeatures(fc([point]))).toEqual([]);
  });
});

describe('resolveActiveTrack', () => {
  const collection = fc([point, line('a'), line('b')]);

  it('returns the selected line when the index is a valid line', () => {
    expect(
      resolveActiveTrack(collection, 2)?.feature.properties?.['name'],
    ).toBe('b');
  });

  it('falls back to the first line when nothing is selected', () => {
    expect(
      resolveActiveTrack(collection, null)?.feature.properties?.['name'],
    ).toBe('a');
  });

  it('falls back to the first line when the selected index is not a line', () => {
    // Index 0 is the Point, not a track.
    expect(resolveActiveTrack(collection, 0)?.index).toBe(1);
  });

  it('is undefined when there are no lines', () => {
    expect(resolveActiveTrack(fc([point]), null)).toBeUndefined();
  });
});
