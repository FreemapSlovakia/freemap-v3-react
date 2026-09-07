import {
  resolveGenericName,
  resolveGenericNameWithMeta,
} from '@osm/osmNameResolver.js';
import { osmTagToNameMapping } from '@osm/osmTagToNameMapping-sk.messages.js';
import { describe, expect, it } from 'vitest';
import { photonToSearchResult } from './resultUtils.js';

const point = {
  type: 'Feature' as const,
  geometry: { type: 'Point' as const, coordinates: [17, 48] },
};

describe('photonToSearchResult', () => {
  it('carries the indexed tag and the name', () => {
    const result = photonToSearchResult(
      {
        ...point,
        properties: {
          osm_type: 'N',
          osm_id: 1,
          osm_key: 'place',
          osm_value: 'city',
          name: 'Bratislava',
        },
      },
      'nominatim-forward',
    );

    expect(result.geojson.properties).toStrictEqual({
      place: 'city',
      name: 'Bratislava',
    });

    expect(result.id).toEqual({ type: 'osm', elementType: 'node', id: 1 });
  });

  it('writes no tag for a hit that has no name', () => {
    const result = photonToSearchResult(
      {
        ...point,
        properties: {
          osm_key: 'building',
          osm_value: 'yes',
          street: 'Pažického',
          housenumber: '10',
        },
      },
      'nominatim-forward',
    );

    // Strict: a `name: undefined` left in would throw in the generic-name
    // resolver, and a loose comparison would not see it.
    expect(result.geojson.properties).toStrictEqual({ building: 'yes' });

    expect(() =>
      resolveGenericNameWithMeta(
        {},
        result.geojson.properties as Record<string, string>,
      ),
    ).not.toThrow();
  });

  it('puts back the parent tag photon drops, so the hit can be named', () => {
    const result = photonToSearchResult(
      {
        ...point,
        // What photon really answers for a guidepost — the `tourism` tag it
        // hangs off in OSM is not in the response.
        properties: { osm_key: 'information', osm_value: 'guidepost' },
      },
      'nominatim-forward',
    );

    expect(result.geojson.properties).toStrictEqual({
      tourism: 'information',
      information: 'guidepost',
    });

    // The mapping is keyed the way OSM tags an element, and nothing was added
    // to it for photon's shape.
    expect(
      resolveGenericName(
        osmTagToNameMapping,
        result.geojson.properties as Record<string, string>,
      ),
    ).toStrictEqual(['Rázcestník, smerovník']);
  });

  it('turns the extent into a GeoJSON bbox', () => {
    const result = photonToSearchResult(
      {
        ...point,
        properties: { extent: [17.09, 48.16, 17.11, 48.14] },
      },
      'nominatim-reverse',
    );

    expect(result.geojson.bbox).toEqual([17.09, 48.14, 17.11, 48.16]);
  });
});

describe('resolveGenericNameWithMeta', () => {
  it('skips a value that is not a string', () => {
    expect(() =>
      resolveGenericNameWithMeta({}, {
        OBJECTID: 42,
        note: null,
        name: 'ok',
      } as unknown as Record<string, string>),
    ).not.toThrow();
  });
});
