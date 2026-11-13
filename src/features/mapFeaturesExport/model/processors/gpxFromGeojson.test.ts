import { parseGpx } from '@features/dataViewer/parseGpx.js';
import type { Feature, FeatureCollection } from 'geojson';
import { describe, expect, it } from 'vitest';
import { geojsonToGpxDoc } from './gpxFromGeojson.js';

// Writes the GeoJSON to GPX, then reads it back the way an import would — the
// writer is lossless exactly when this returns features matching the input.
function roundTrip(geojson: Feature | FeatureCollection): Feature[] {
  const xml = new XMLSerializer().serializeToString(geojsonToGpxDoc(geojson));

  return parseGpx(new DOMParser().parseFromString(xml, 'text/xml')).features;
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
      accuracies: [4, 5, 6],
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

  it('preserves a track’s own metadata, links and number', () => {
    const properties = {
      name: 'Ride',
      cmt: 'a comment',
      desc: 'a description',
      src: 'Garmin eTrex',
      number: 3,
      type: 'cycling',
      links: [{ href: 'https://example.com/ride', text: 'Ride', type: null }],
    };

    const [f] = roundTrip(
      fc([
        {
          type: 'Feature',
          properties,
          geometry: {
            type: 'LineString',
            coordinates: [
              [17.0, 48.0],
              [17.001, 48.0],
            ],
          },
        },
      ]),
    );

    expect(f!.properties).toMatchObject({
      ...properties,
      links: [{ href: 'https://example.com/ride', text: 'Ride' }],
    });
  });

  it('preserves a waypoint’s source and links', () => {
    const [f] = roundTrip(
      fc([
        {
          type: 'Feature',
          properties: {
            name: 'WP',
            src: 'survey',
            links: [{ href: 'https://example.com/wp' }],
          },
          geometry: { type: 'Point', coordinates: [17.0, 48.0] },
        },
      ]),
    );

    expect(f!.properties).toMatchObject({
      src: 'survey',
      links: [{ href: 'https://example.com/wp' }],
    });
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

  it('preserves a line’s label, property table and style', () => {
    const properties = {
      name: 'Ridge',
      'freemap:label': '{p:name}',
      'freemap:props': { name: 'Ridge', 'my own': 'kept' },
      'freemap:type': 'polygon',
      'freemap:color': '#ff000080',
      'freemap:fillColor': '#00ff0033',
      'freemap:width': '3',
      'freemap:lineCap': 'butt',
      'freemap:lineJoin': 'bevel',
      'freemap:dashArray': '5 5',
    };

    const [f] = roundTrip(
      fc([
        {
          type: 'Feature',
          properties,
          geometry: {
            type: 'LineString',
            coordinates: [
              [17.0, 48.0],
              [17.001, 48.0],
              [17.0, 48.0],
            ],
          },
        },
      ]),
    );

    expect(f!.properties).toMatchObject(properties);
  });

  it('preserves a waypoint’s label, table and marker', () => {
    const properties = {
      name: 'Dubník 504',
      'freemap:label': '{p:name} {p:ele}',
      'freemap:props': { name: 'Dubník', ele: '504' },
      'freemap:color': '#0000ffff',
      'freemap:icon': 'poi:church',
      'freemap:markerType': 'square',
      'osmand:background': 'square',
    };

    const [f] = roundTrip(
      fc([
        {
          type: 'Feature',
          properties,
          geometry: { type: 'Point', coordinates: [17.0, 48.0] },
        },
      ]),
    );

    expect(f!.properties).toMatchObject(properties);
  });

  it('writes a well-known foreign extension back under its own namespace', () => {
    const [f] = roundTrip(
      fc([
        {
          type: 'Feature',
          properties: {
            'gpxx:DisplayColor': 'Red',
            // No prefix we know binds this one, so it cannot be written back
            // without inventing a namespace for it.
            'whoknows:Thing': 'x',
          },
          geometry: {
            type: 'LineString',
            coordinates: [
              [17.0, 48.0],
              [17.001, 48.0],
            ],
          },
        },
      ]),
    );

    expect(f!.properties?.['gpxx:DisplayColor']).toBe('Red');
    expect(f!.properties?.['whoknows:Thing']).toBeUndefined();
  });

  it('nests a Garmin field in the container its own tools look in', () => {
    const xml = new XMLSerializer().serializeToString(
      geojsonToGpxDoc({
        type: 'Feature',
        properties: { 'gpxx:DisplayColor': 'Red' },
        geometry: {
          type: 'LineString',
          coordinates: [
            [17.0, 48.0],
            [17.001, 48.0],
          ],
        },
      }),
    );

    expect(xml).toContain('<gpxx:TrackExtension');
    expect(xml).toContain('<gpxx:DisplayColor>Red</gpxx:DisplayColor>');
  });

  it('carries data GPX has no element of its own for', () => {
    const [f] = roundTrip(
      fc([
        {
          type: 'Feature',
          properties: {
            name: 'T',
            // GPX states these itself…
            desc: 'a description',
            cmt: 'a comment',
            type: 'hiking',
            src: 'a source',
            // …and has nowhere for these but our table.
            surface: 'gravel',
            operator: 'KST',
          },
          geometry: {
            type: 'LineString',
            coordinates: [
              [17.0, 48.0],
              [17.001, 48.0],
            ],
          },
        },
      ]),
    );

    expect(f!.properties).toMatchObject({
      name: 'T',
      desc: 'a description',
      cmt: 'a comment',
      type: 'hiking',
      src: 'a source',
      'freemap:props': { surface: 'gravel', operator: 'KST' },
    });
  });

  it('ties the holes of a polygon to it by id', () => {
    const [outer, hole] = roundTrip(
      fc([
        {
          type: 'Feature',
          properties: { name: 'Lake', fill: '#0000ff' },
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [17.0, 48.0],
                [17.01, 48.0],
                [17.01, 48.01],
                [17.0, 48.0],
              ],
              [
                [17.002, 48.002],
                [17.004, 48.002],
                [17.004, 48.004],
                [17.002, 48.002],
              ],
            ],
          },
        },
      ]),
    );

    const id = outer!.properties?.['freemap:polygonId'];

    expect(id).toEqual(expect.any(String));
    expect(outer!.properties?.['freemap:type']).toBe('polygon');
    expect(outer!.properties?.['name']).toBe('Lake');

    expect(hole!.properties).toMatchObject({
      'freemap:holeOf': id,
      'freemap:type': 'polygon',
    });

    // Unfilled, so a reader that ignores `fm:holeOf` does not paint it in.
    expect(hole!.properties?.['freemap:fillColor']).toMatch(/00$/);
    expect(hole!.properties?.['name']).toBeUndefined();
  });

  describe('a polygon with holes', () => {
    const lake = (properties: Feature['properties']): Feature => ({
      type: 'Feature',
      properties,
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [17.0, 48.0],
            [17.01, 48.0],
            [17.01, 48.01],
            [17.0, 48.0],
          ],
          [
            [17.002, 48.002],
            [17.004, 48.002],
            [17.004, 48.004],
            [17.002, 48.002],
          ],
        ],
      },
    });

    it('leaves a hole unfilled though its polygon has no style', () => {
      const [, hole] = roundTrip(fc([lake({})]));

      expect(hole!.properties?.['freemap:fillColor']).toMatch(/00$/);
    });

    it('writes each hole’s own per-point series', () => {
      const times = (minute: number) =>
        [0, 1, 2, 3].map((i) => `2020-01-01T00:0${minute}:0${i}.000Z`);

      const [, hole] = roundTrip(
        fc([lake({ coordinateProperties: { times: [times(0), times(1)] } })]),
      );

      expect(hole!.properties?.['coordinateProperties']).toMatchObject({
        times: times(1),
      });
    });

    it('drops a stray hole id from the polygon itself', () => {
      const [outer] = roundTrip(fc([lake({ 'freemap:holeOf': 'x' })]));

      expect(outer!.properties?.['freemap:holeOf']).toBeUndefined();
      expect(outer!.properties?.['freemap:polygonId']).toEqual(
        expect.any(String),
      );
    });
  });

  it('keeps a GeoJSON polygon a polygon', () => {
    const [f] = roundTrip(
      fc([
        {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [17.0, 48.0],
                [17.001, 48.0],
                [17.001, 48.001],
                [17.0, 48.0],
              ],
            ],
          },
        },
      ]),
    );

    // GPX writes it as a closed `<trk>`, so only `fm:type` can say what it was.
    expect(f!.properties?.['freemap:type']).toBe('polygon');
  });

  it('carries a style stated in simplestyle alone through GPX', () => {
    const [f] = roundTrip(
      fc([
        {
          type: 'Feature',
          properties: { stroke: '#ff0000', 'stroke-width': 6 },
          geometry: {
            type: 'LineString',
            coordinates: [
              [17.0, 48.0],
              [17.001, 48.0],
            ],
          },
        },
      ]),
    );

    // GPX has no simplestyle, so it travels as `fm:*` — which is also what the
    // reader trusts first, so the style comes back as it went in.
    expect(f!.properties).toMatchObject({
      'freemap:color': '#ff0000',
      'freemap:width': '6',
    });
  });
});
