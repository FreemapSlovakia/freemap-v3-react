import { LAYER_ALIASES } from '@shared/mapDefinitions.js';
import { describe, expect, it } from 'vitest';
import {
  bundledBodies,
  knownLayerIds,
  loadIntegratedLayerDef,
  mapIndex,
} from './mapIndex.js';

describe('mapIndex', () => {
  it('gives every map its own id', () => {
    const ids = mapIndex.map((entry) => entry.type);

    expect(new Set(ids).size).toBe(ids.length);
  });

  it('loads a body for every map', async () => {
    for (const entry of mapIndex) {
      const body = await entry.load();

      expect(body.attribution, entry.type).toBeInstanceOf(Array);

      // A body carries only what the index doesn't.
      expect(body, entry.type).not.toHaveProperty('type');

      expect(body, entry.type).not.toHaveProperty('technology');
    }
    // transforming every body module takes seconds under a full parallel run
  }, 30_000);

  it('knows the retired ids too', () => {
    expect(knownLayerIds()).toEqual(
      expect.arrayContaining(['X', ...Object.keys(LAYER_ALIASES)]),
    );
  });

  it('bundles the common maps and the feature layers', () => {
    expect(Object.keys(bundledBodies).sort()).toEqual(
      ['I', 'O', 'R', 'S', 'X', 'c', 'h', 'i', 'v', 'w'].sort(),
    );
  });

  it('loads a map whole, or nothing for an unknown id', async () => {
    expect(await loadIntegratedLayerDef('WKA')).toMatchObject({
      type: 'WKA',
      layer: 'base',
      technology: 'wms',
    });

    expect(await loadIntegratedLayerDef('nope')).toBeUndefined();
  });
});
