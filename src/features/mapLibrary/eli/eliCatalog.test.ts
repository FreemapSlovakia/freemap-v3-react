import { isCatalogId } from '@shared/mapLibrary/catalogId.js';
import { mapIndexById } from '@shared/mapLibrary/mapIndex.js';
import { describe, expect, it } from 'vitest';
import catalog from './eliCatalog.json' with { type: 'json' };
import table from './ids.json' with { type: 'json' };

const { maps } = catalog;

describe('eliCatalog.json', () => {
  it('has catalog ids only, each once and none built in', () => {
    const types = maps.map((map) => map.type);

    expect(types.filter((type) => !isCatalogId(type))).toEqual([]);

    expect(new Set(types).size).toBe(types.length);

    expect(types.filter((type) => type in mapIndexById)).toEqual([]);
  });

  it('takes every id from the committed table', () => {
    const allocated = new Set(Object.values(table.ids));

    expect(maps.filter((map) => !allocated.has(map.type))).toEqual([]);
  });

  it('has Leaflet tile templates', () => {
    expect(
      maps.filter(
        (map) =>
          !('technology' in map) &&
          (!/^(https:)?\/\//.test(map.body.url) ||
            !['{z}', '{x}', '{y}'].every((p) => map.body.url.includes(p))),
      ),
    ).toEqual([]);
  });

  it('has WMS base URLs with layers and no request parameters', () => {
    expect(
      maps.filter(
        (map) =>
          'technology' in map &&
          (!/^https:\/\//.test(map.body.url) ||
            /[?&](request|layers|bbox|srs|crs)=/i.test(map.body.url) ||
            !('layers' in map.body) ||
            !map.body.layers?.length),
      ),
    ).toEqual([]);
  });
});
