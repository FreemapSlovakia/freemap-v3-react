import { describe, expect, it } from 'vitest';
import { TerrainCreditsSchema } from './terrainService.js';

/**
 * Pins the wire contract for `meta.sources`. The payload is a real one, cut
 * from a `POST /panorama` of a 30° slice over eastern Slovakia — the service
 * resolves the credit lines itself, so a change to its `source.json` reading
 * shows up here rather than as a silently empty footer.
 */
const REAL_SOURCES = [
  {
    source: 'sk',
    attributions: [
      {
        name: 'DMR 5.0: ÚGKK SR',
        url: 'https://www.skgeodesy.sk/gku/produkty-sluzby/na-stiahnutie/zbgis.html#lls',
      },
    ],
  },
  {
    source: 'pl',
    attributions: [
      { name: 'NMT: GUGiK', url: 'https://www.geoportal.gov.pl/' },
    ],
  },
  {
    source: 'gedtm30',
    attributions: [
      { name: 'GEDTM30', url: 'https://codeberg.org/openlandmap/GEDTM30' },
    ],
  },
];

describe('TerrainCreditsSchema', () => {
  it('flattens what the service actually sends', () => {
    expect(TerrainCreditsSchema.parse(REAL_SOURCES)).toEqual([
      {
        type: 'data',
        name: 'DMR 5.0: ÚGKK SR',
        url: 'https://www.skgeodesy.sk/gku/produkty-sluzby/na-stiahnutie/zbgis.html#lls',
      },
      {
        type: 'data',
        name: 'NMT: GUGiK',
        url: 'https://www.geoportal.gov.pl/',
      },
      {
        type: 'data',
        name: 'GEDTM30',
        url: 'https://codeberg.org/openlandmap/GEDTM30',
      },
    ]);
  });

  it('keeps both credits of a model that is two datasets', () => {
    expect(
      TerrainCreditsSchema.parse([
        { source: 'be', attributions: [{ name: 'SPW' }, { name: 'DHMV II' }] },
      ]),
    ).toEqual([
      { type: 'data', name: 'SPW' },
      { type: 'data', name: 'DHMV II' },
    ]);
  });

  // A service that predates the field, and anything malformed: both read as
  // "nothing reported", which credits every model rather than none.
  it('reads a missing or malformed list as nothing reported', () => {
    expect(TerrainCreditsSchema.parse(undefined)).toEqual([]);
    expect(TerrainCreditsSchema.parse(['sk', 'pl'])).toEqual([]);
    expect(TerrainCreditsSchema.parse([{ source: 'sk' }])).toEqual([]);
  });
});
