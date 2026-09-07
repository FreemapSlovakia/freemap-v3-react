import { describe, expect, it } from 'vitest';
import type { Track, TrackPoint } from './model/types.js';
import { tracksToFeatureCollection } from './trackGeojson.js';

const T0 = Date.parse('2026-08-16T10:00:00Z');

const pt = (n: number, overrides: Partial<TrackPoint> = {}): TrackPoint => ({
  id: n,
  lat: 48 + n / 1000,
  lon: 17,
  ts: new Date(T0 + n * 60000),
  ...overrides,
});

const track = (overrides: Partial<Track> = {}): Track => ({
  token: 'tok',
  trackPoints: [pt(0), pt(1), pt(2)],
  ...overrides,
});

describe('tracksToFeatureCollection', () => {
  it('names the line after the device and stamps it as a recording', () => {
    const { features } = tracksToFeatureCollection([track({ label: 'Bike' })]);

    expect(features).toHaveLength(1);

    expect(features[0]!.properties?.['name']).toBe('Bike');

    expect(features[0]!.properties?.['fm:kind']).toBe('track');
  });

  it('carries the altitude only where the device reported one', () => {
    const { features } = tracksToFeatureCollection([
      track({
        trackPoints: [
          pt(0, { altitude: 512 }),
          pt(1),
          pt(2, { altitude: 530 }),
        ],
      }),
    ]);

    expect(features[0]!.geometry).toMatchObject({
      coordinates: [
        [17, 48, 512],
        [17, 48.001],
        [17, 48.002, 530],
      ],
    });
  });

  it('writes the per-point series under the names the GPX writer reads', () => {
    const { features } = tracksToFeatureCollection([
      track({
        trackPoints: [
          pt(0, { speed: 3, bearing: 90, accuracy: 5, battery: 80 }),
          pt(1),
        ],
      }),
    ]);

    expect(features[0]!.properties?.['coordinateProperties']).toEqual({
      times: [new Date(T0).toISOString(), new Date(T0 + 60000).toISOString()],
      speeds: [3, null],
      courses: [90, null],
      accuracies: [5, null],
      battery: [80, null],
      gsmSignal: [null, null],
    });
  });

  it('breaks the track where the device says the feed jumped', () => {
    const { features } = tracksToFeatureCollection([
      track({ splitDuration: 30, trackPoints: [pt(0), pt(1), pt(60), pt(61)] }),
    ]);

    expect(features).toHaveLength(2);
  });

  it('drops what is not a line — a lone position, and a track with none', () => {
    expect(
      tracksToFeatureCollection([
        track({ splitDuration: 30, trackPoints: [pt(0), pt(60), pt(61)] }),
        track({ token: 'other', trackPoints: [pt(0)] }),
      ]).features,
    ).toHaveLength(1);
  });
});
