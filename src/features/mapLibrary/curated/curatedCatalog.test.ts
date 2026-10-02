import { isCatalogId } from '@shared/mapLibrary/catalogId.js';
import { mapIndexById } from '@shared/mapLibrary/mapIndex.js';
import { describe, expect, it } from 'vitest';
import eliCatalog from '../eli/eliCatalog.json' with { type: 'json' };
import eliTable from '../eli/ids.json' with { type: 'json' };
import curated from './curatedCatalog.json' with { type: 'json' };

const { maps } = curated;

describe('curatedCatalog.json', () => {
  it('has catalog ids only, each once, none built in or from ELI', () => {
    const types = maps.map((map) => map.type);

    expect(types.filter((type) => !isCatalogId(type))).toEqual([]);

    expect(new Set(types).size).toBe(types.length);

    expect(types.filter((type) => type in mapIndexById)).toEqual([]);

    // The harvest allocates at random, so a clash is checked rather than ruled out.
    const eliIds = new Set([
      ...Object.values(eliTable.ids),
      ...eliCatalog.maps.map((map) => map.type),
    ]);

    expect(types.filter((type) => eliIds.has(type))).toEqual([]);
  });

  it('has HTTPS services: a tile template, or a WMS with its layers', () => {
    const ok = (map: (typeof maps)[number]) => {
      if (!map.body.url.startsWith('https://')) {
        return false;
      }

      return 'layers' in map.body
        ? map.technology === 'wms' && map.body.layers.length > 0
        : map.technology !== 'wms' &&
            ['{z}', '{x}', '{y}'].every((p) => map.body.url.includes(p));
    };

    expect(maps.filter((map) => !ok(map))).toEqual([]);
  });

  it('credits every map', () => {
    expect(maps.filter((map) => map.body.attribution.length === 0)).toEqual([]);
  });
});
