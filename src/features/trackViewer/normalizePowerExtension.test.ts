import type { Feature, LineString } from 'geojson';
import { describe, expect, it } from 'vitest';
import { normalizePowerExtension } from './normalizePowerExtension.js';

function line(
  coordinateProperties: Record<string, unknown>,
): Feature<LineString> {
  return {
    type: 'Feature',
    properties: { coordinateProperties },
    geometry: {
      type: 'LineString',
      coordinates: [
        [0, 0],
        [1, 1],
      ],
    },
  };
}

describe('normalizePowerExtension', () => {
  it('renames gpxpx:PowerExtensions to powers', () => {
    const f = line({ 'gpxpx:PowerExtensions': [200, 209] });

    normalizePowerExtension([f]);

    const cp = f.properties?.['coordinateProperties'] as Record<
      string,
      unknown
    >;

    expect(cp['powers']).toEqual([200, 209]);
    expect(cp['gpxpx:PowerExtensions']).toBeUndefined();
  });

  it('keeps an existing powers series', () => {
    const f = line({ powers: [1, 2], 'gpxpx:PowerExtensions': [200, 209] });

    normalizePowerExtension([f]);

    const cp = f.properties?.['coordinateProperties'] as Record<
      string,
      unknown
    >;

    expect(cp['powers']).toEqual([1, 2]);
  });

  it('is a no-op without the extension', () => {
    const f = line({ heart: [120, 130] });

    expect(() => normalizePowerExtension([f])).not.toThrow();

    const cp = f.properties?.['coordinateProperties'] as Record<
      string,
      unknown
    >;

    expect(cp['powers']).toBeUndefined();
  });
});
