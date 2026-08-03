import { describe, expect, it } from 'vitest';
import type { RecorderPoint } from './protocol.js';
import {
  recorderSegmentsToProfileFeature,
  recorderSegmentToFeature,
} from './trackGeojson.js';

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

describe('recorderSegmentsToProfileFeature', () => {
  const elevated = (seq: number) => pt(seq, { altMsl: 200 + seq });

  it('keeps the segments apart, so the profile breaks where the ride did', () => {
    expect(
      recorderSegmentsToProfileFeature([
        [elevated(1), elevated(2)],
        [elevated(3), elevated(4)],
      ])?.geometry,
    ).toEqual({
      type: 'MultiLineString',
      coordinates: [
        [
          [17, 48, 201],
          [17, 48, 202],
        ],
        [
          [17, 48, 203],
          [17, 48, 204],
        ],
      ],
    });
  });

  it('drops a segment too short to be a line', () => {
    expect(
      recorderSegmentsToProfileFeature([
        [elevated(1), elevated(2)],
        [elevated(3)],
      ])?.geometry.coordinates,
    ).toHaveLength(1);
  });

  it('has no profile until two fixes carry an altitude', () => {
    expect(recorderSegmentsToProfileFeature([])).toBeNull();

    expect(recorderSegmentsToProfileFeature([[pt(1), pt(2)]])).toBeNull();

    expect(recorderSegmentsToProfileFeature([[elevated(1), pt(2)]])).toBeNull();

    expect(
      recorderSegmentsToProfileFeature([[elevated(1), elevated(2)]]),
    ).not.toBeNull();
  });
});
