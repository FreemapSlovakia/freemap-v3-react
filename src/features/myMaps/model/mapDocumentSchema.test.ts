import { describe, expect, it } from 'vitest';
import { MapsLoadResponseSchema } from './mapDocumentSchema.js';

const DataSchema = MapsLoadResponseSchema.shape.data;

// Offline copies are validated through this schema on read and an unreadable one
// is discarded as a cache miss — so a document written by an older version has
// to keep parsing, or every user's offline maps quietly disappear.
describe('map document schema — what an older copy still reads as', () => {
  it('reads a route that carries no computed result', () => {
    const parsed = DataSchema.parse({
      routePlanner: {
        transportType: 'hiking',
        points: [
          { lat: 48, lon: 17 },
          { lat: 49, lon: 18 },
        ],
      },
    });

    expect(parsed.routePlanner?.points).toHaveLength(2);
    expect(parsed.routePlanner?.result).toBeUndefined();
  });

  it('reads a legacy start/midpoints/finish route', () => {
    const parsed = DataSchema.parse({
      routePlanner: {
        transportType: 'hiking',
        start: { lat: 48, lon: 17 },
        midpoints: [{ lat: 48.5, lon: 17.5 }],
        finish: { lat: 49, lon: 18 },
      },
    });

    expect(parsed.routePlanner?.points).toHaveLength(3);
  });

  it('reads an empty document', () => {
    expect(DataSchema.parse({})).toEqual({});
  });
});

// A route with no routed segment — a straight-line transport, or every request
// failing — used to carry `NaN` durations, which `JSON.stringify` writes as
// `null`. Rejecting the document over that would leave the map unopenable, its
// offline copy discarded as unreadable along with it.
describe('map document schema — a route it cannot read', () => {
  const doc = (result: unknown) => ({
    routePlanner: {
      points: [
        { lat: 48, lon: 17 },
        { lat: 49, lon: 18 },
      ],
      result,
    },
  });

  it('drops the route rather than the map', () => {
    const parsed = DataSchema.parse(
      doc({
        key: 'k',
        timestamp: 1000,
        alternative: {
          distance: 1,
          duration: null,
          legs: [],
        },
        waypoints: [],
      }),
    );

    expect(parsed.routePlanner?.points).toHaveLength(2);
    expect(parsed.routePlanner?.result).toBeUndefined();
  });

  it('drops a route of an unreadable shape entirely', () => {
    expect(
      DataSchema.parse(doc('nonsense')).routePlanner?.result,
    ).toBeUndefined();
  });
});

describe('map document schema — the results pinned to a map', () => {
  const osmPin = {
    source: 'osm',
    id: { type: 'osm', elementType: 'node', id: 1 },
    geojson: {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [17, 48] },
      properties: { name: 'Ganek' },
    },
    incomplete: true,
    displayName: 'Ganek',
  };

  it('reads a document written before pins were stored', () => {
    expect(
      DataSchema.parse({ objectsV2: { active: [] } }).search,
    ).toBeUndefined();
  });

  it('reads a pinned OSM element back unchanged', () => {
    expect(DataSchema.parse({ search: { results: [osmPin] } }).search).toEqual({
      results: [osmPin],
    });
  });

  it('reads a pin the URL cannot name', () => {
    const wms = {
      source: 'wms:foo',
      id: { type: 'wms', map: 'foo', seq: 2, property: 'gid', id: 9 },
      geojson: { type: 'Feature', geometry: null, properties: null },
    };

    expect(
      DataSchema.parse({ search: { results: [wms] } }).search?.results,
    ).toHaveLength(1);
  });

  it('reads a collection carrying properties of its own', () => {
    const way = {
      source: 'osm',
      id: { type: 'osm', elementType: 'way', id: 5 },
      geojson: {
        type: 'FeatureCollection',
        properties: { highway: 'path' },
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: [
                [17, 48],
                [18, 49],
              ],
            },
            properties: {},
          },
        ],
      },
    };

    expect(
      DataSchema.parse({ search: { results: [way] } }).search?.results,
    ).toHaveLength(1);
  });

  // Nominatim answers a point with a box padded around it, which is not the
  // exact extent GeoJSON validation insists on — and this is the very kind of
  // pin the document exists to carry, having no id the URL could name.
  it('reads a geocoding hit whose bbox is padded around its point', () => {
    const nominatim = {
      source: 'nominatim-forward',
      id: { type: 'other', id: 7 },
      geojson: {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [20.1234, 49.1234] },
        properties: { name: 'Ganek' },
        bbox: [20.12335, 49.12335, 20.12345, 49.12345],
      },
      displayName: 'Ganek',
    };

    expect(
      DataSchema.parse({ search: { results: [nominatim] } }).search?.results,
    ).toEqual([nominatim]);
  });

  it('reads a geocoding hit that came without an outline', () => {
    expect(
      DataSchema.parse({
        search: {
          results: [
            {
              source: 'nominatim-forward',
              id: { type: 'other', id: 8 },
              geojson: { type: 'Feature', geometry: null, properties: {} },
            },
          ],
        },
      }).search?.results,
    ).toHaveLength(1);
  });

  it('reads pasted GeoJSON, which is a collection carrying no properties', () => {
    expect(
      DataSchema.parse({
        search: {
          results: [
            {
              source: 'geojson',
              id: { type: 'other', id: 9 },
              geojson: {
                type: 'FeatureCollection',
                features: [
                  {
                    type: 'Feature',
                    geometry: { type: 'Point', coordinates: [17, 48] },
                    properties: {},
                  },
                ],
              },
            },
          ],
        },
      }).search?.results,
    ).toHaveLength(1);
  });

  it('still rejects a bbox that is not one', () => {
    expect(
      DataSchema.parse({
        search: {
          results: [
            {
              ...osmPin,
              geojson: { ...osmPin.geojson, bbox: ['x', 1, 2, 3] },
            },
          ],
        },
      }).search?.results,
    ).toEqual([]);
  });

  // They are a cache of what the map holds, so an unreadable one costs itself
  // and nothing else — neither the pins beside it nor the map, which taking the
  // document down with it would leave unopenable.
  it('drops an unreadable pin without taking the others with it', () => {
    const parsed = DataSchema.parse({
      objectsV2: { active: ['amenity=shelter'] },
      search: { results: ['nonsense', osmPin] },
    });

    expect(parsed.objectsV2?.active).toEqual(['amenity=shelter']);
    expect(parsed.search?.results).toEqual([osmPin]);
  });

  it('drops a `search` of an unreadable shape entirely', () => {
    expect(DataSchema.parse({ search: 'nonsense' }).search).toBeUndefined();
  });
});
