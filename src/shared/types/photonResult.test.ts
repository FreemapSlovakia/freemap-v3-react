import { describe, expect, it } from 'vitest';
import {
  PhotonResponseSchema,
  photonDisplayName,
  photonExtentToBBox,
  photonLang,
} from './photonResult.js';

describe('photonLang', () => {
  it('passes an imported language through', () => {
    expect(photonLang('sk')).toBe('sk');
  });

  it('falls back for a language the index does not carry', () => {
    expect(photonLang('da')).toBe('default');
  });
});

describe('photonExtentToBBox', () => {
  it('reorders west/north/east/south into a GeoJSON bbox', () => {
    expect(
      photonExtentToBBox([17.0994612, 48.1539873, 17.0997117, 48.1538199]),
    ).toEqual([17.0994612, 48.1538199, 17.0997117, 48.1539873]);
  });
});

describe('photonDisplayName', () => {
  it('joins the address parts outwards', () => {
    expect(
      photonDisplayName({
        name: 'Slavín',
        district: 'Staré Mesto',
        county: 'okres Bratislava I',
        state: 'Bratislavský kraj',
        country: 'Slovensko',
        postcode: '811 06',
      }),
    ).toBe(
      'Slavín, Staré Mesto, okres Bratislava I, Bratislavský kraj, 811 06, Slovensko',
    );
  });

  it('leads with the street when the hit has no name', () => {
    expect(
      photonDisplayName({
        street: 'Pažického',
        housenumber: '10',
        city: 'Bratislava',
      }),
    ).toBe('Pažického 10, Bratislava');
  });

  it('drops a part that repeats one already taken', () => {
    expect(photonDisplayName({ name: 'Bratislava', city: 'Bratislava' })).toBe(
      'Bratislava',
    );
  });

  it('ignores the nulls Photon sends for absent parts', () => {
    expect(photonDisplayName({ name: 'Wien', city: null, county: null })).toBe(
      'Wien',
    );
  });
});

describe('PhotonResponseSchema', () => {
  it('accepts a response carrying properties it does not know', () => {
    const parsed = PhotonResponseSchema.parse({
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [17.1093063, 48.1516988] },
          properties: {
            osm_type: 'N',
            osm_id: 530544342,
            osm_key: 'place',
            osm_value: 'city',
            name: 'Bratislava',
            somethingNew: 'kept',
          },
        },
      ],
    });

    expect(parsed.features[0].properties['somethingNew']).toBe('kept');
  });
});
