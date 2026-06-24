import { gpx } from '@tmcw/togeojson';
import type { Feature, FeatureCollection } from 'geojson';
import { describe, expect, it } from 'vitest';
import { geojsonToGpxDoc } from './gpxFromGeojson.js';

// Writes the GeoJSON to GPX, then parses it back with togeojson — the writer is
// lossless exactly when this returns features matching the input.
function roundTrip(geojson: Feature | FeatureCollection): Feature[] {
  const xml = new XMLSerializer().serializeToString(geojsonToGpxDoc(geojson));

  return gpx(new DOMParser().parseFromString(xml, 'text/xml')).features;
}

function fc(features: Feature[]): FeatureCollection {
  return { type: 'FeatureCollection', features };
}

describe('geojsonToGpxDoc round-trip', () => {
  it('preserves a track with elevation, time and all sensor channels', () => {
    const coordinateProperties = {
      times: [
        '2020-01-01T00:00:00.000Z',
        '2020-01-01T00:00:05.000Z',
        '2020-01-01T00:00:10.000Z',
      ],
      heart: [120, 130, 140],
      cads: [80, 82, 84],
      atemps: [21, 21.5, 22],
      wtemps: [15, 15.5, 16],
      depths: [3, 4, 5],
      speeds: [2.5, 3, 3.5],
      courses: [10, 20, 30],
      bearings: [12, 22, 32],
      powers: [200, 210, 220],
    };

    const coordinates = [
      [17.0, 48.0, 100],
      [17.001, 48.0, 110],
      [17.002, 48.0, 120],
    ];

    const [f] = roundTrip(
      fc([
        {
          type: 'Feature',
          properties: { name: 'Track', coordinateProperties },
          geometry: { type: 'LineString', coordinates },
        },
      ]),
    );

    expect(f!.geometry).toMatchObject({ type: 'LineString', coordinates });
    expect(f!.properties?.['_gpxType']).toBe('trk');
    expect(f!.properties?.['coordinateProperties']).toEqual(
      coordinateProperties,
    );
  });

  it('keeps the route/track distinction (_gpxType: rte)', () => {
    const coordinates = [
      [17.0, 48.0, 100],
      [17.001, 48.0, 110],
    ];

    const [f] = roundTrip(
      fc([
        {
          type: 'Feature',
          properties: { name: 'Route', _gpxType: 'rte' },
          geometry: { type: 'LineString', coordinates },
        },
      ]),
    );

    expect(f!.properties?.['_gpxType']).toBe('rte');
    expect(f!.geometry).toMatchObject({ type: 'LineString', coordinates });
  });

  it('preserves waypoint metadata and elevation', () => {
    const properties = {
      name: 'WP',
      sym: 'Summit',
      type: 'peak',
      cmt: 'a comment',
      desc: 'a description',
      time: '2020-01-01T00:00:00.000Z',
    };

    const [f] = roundTrip(
      fc([
        {
          type: 'Feature',
          properties,
          geometry: { type: 'Point', coordinates: [17.0, 48.0, 555] },
        },
      ]),
    );

    expect(f!.geometry).toMatchObject({
      type: 'Point',
      coordinates: [17.0, 48.0, 555],
    });
    expect(f!.properties).toMatchObject(properties);
  });

  it('preserves per-segment sensor data across a MultiLineString', () => {
    const coordinateProperties = {
      heart: [
        [120, 121],
        [130, 131],
      ],
    };

    const coordinates = [
      [
        [17.0, 48.0],
        [17.001, 48.0],
      ],
      [
        [17.002, 48.0],
        [17.003, 48.0],
      ],
    ];

    const [f] = roundTrip(
      fc([
        {
          type: 'Feature',
          properties: { name: 'Multi', coordinateProperties },
          geometry: { type: 'MultiLineString', coordinates },
        },
      ]),
    );

    expect(f!.geometry).toMatchObject({ type: 'MultiLineString', coordinates });
    expect(f!.properties?.['coordinateProperties']).toEqual(
      coordinateProperties,
    );
  });
});
