import { describe, expect, it } from 'vitest';
import type { RecorderPoint } from './protocol.js';
import { recorderSegmentToFeature } from './trackGeojson.js';

const T0 = 1785174195365;

const pt = (
  seq: number,
  overrides: Partial<RecorderPoint> = {},
): RecorderPoint => ({
  seq,
  ts: T0 + seq * 1000,
  lat: 48,
  lon: 17,
  alt: null,
  altMsl: null,
  acc: null,
  spd: null,
  brg: null,
  sat: null,
  seg: 0,
  ...overrides,
});

const elevations = (points: RecorderPoint[]) =>
  recorderSegmentToFeature(points).geometry.coordinates.map((c) => c[2]);

describe('recorderSegmentToFeature', () => {
  it('takes the elevation above sea level, not above the ellipsoid', () => {
    // GPX `<ele>` is defined as metres above mean sea level, and the two differ
    // by the geoid separation — some 42 m over Slovakia.
    expect(elevations([pt(1, { alt: 279.2, altMsl: 237.1 })])).toEqual([237.1]);
  });

  it('falls back to the ellipsoidal altitude', () => {
    // `altMsl` is null below Android 14 and until a GNSS fix has been seen.
    expect(elevations([pt(1, { alt: 279.2 })])).toEqual([279.2]);
  });

  it('omits the elevation of a fix that carried none', () => {
    expect(recorderSegmentToFeature([pt(1)]).geometry.coordinates).toEqual([
      [17, 48],
    ]);
  });
});
