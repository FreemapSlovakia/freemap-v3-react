import type { RootState } from '@app/store/store.js';
import { describe, expect, it } from 'vitest';
import { mapLibraryInitialState } from './reducer.js';
import {
  integratedLayerDefMapSelector,
  integratedLayerDefsSelector,
  mapByIdSelector,
  mapEntryOf,
} from './selectors.js';

const stateWith = (
  layers: string[],
  layersSettings: Record<string, { installed?: boolean }>,
) =>
  ({
    map: {
      layers,
      layersSettings,
      layerSetups: {},
      catalogMaps: [],
      presets: [],
      linkPresets: [],
    },
    mapLibrary: mapLibraryInitialState,
  }) as unknown as RootState;

describe('integratedLayerDefsSelector', () => {
  it('has the bundled maps from the start', () => {
    const types = integratedLayerDefsSelector(stateWith([], {})).map(
      (def) => def.type,
    );

    expect(types).toEqual(expect.arrayContaining(['X', 'S', 'O', 'h']));

    expect(types).not.toContain('WKA');
  });

  it('lists an uninstalled map only while it is on', () => {
    const settings = { O: { installed: false } };

    const types = (layers: string[]) =>
      integratedLayerDefsSelector(stateWith(layers, settings)).map(
        (def) => def.type,
      );

    expect(types(['X'])).not.toContain('O');

    expect(types(['O'])).toContain('O');
  });

  it('lists a known catalog map once installed', () => {
    const state = {
      map: {
        layers: ['X'],
        layersSettings: { Z0001: { installed: true } },
        layerSetups: {},
        presets: [],
        linkPresets: [],
        catalogMaps: [
          {
            type: 'Z0001',
            layer: 'overlay',
            name: 'Test',
            body: {
              url: 'https://example.com/{z}/{x}/{y}.png',
              attribution: [],
            },
          },
        ],
      },
      mapLibrary: mapLibraryInitialState,
    } as unknown as RootState;

    expect(
      integratedLayerDefsSelector(state).find((def) => def.type === 'Z0001'),
    ).toMatchObject({ name: 'Test', technology: 'tile' });
  });

  it('still looks an uninstalled map up by id', () => {
    expect(
      integratedLayerDefMapSelector(stateWith([], { O: { installed: false } }))[
        'O'
      ],
    ).toMatchObject({ technology: 'tile' });
  });
});

describe('mapByIdSelector', () => {
  const tile = (type: string, layer: 'base' | 'overlay') => ({
    type,
    layer,
    technology: 'tile',
    url: 'https://example.com/{z}/{x}/{y}.png',
  });

  const state = {
    ...stateWith([], {}),
    map: {
      ...stateWith([], {}).map,
      layerSetups: { '.1': { kind: 'overlay' } },
      customLayers: [tile('.1', 'base'), tile('.2', 'base')],
      cachedMaps: [tile('.2', 'overlay'), tile('~1', 'overlay')],
    },
  } as unknown as RootState;

  const byId = mapByIdSelector(state);

  it('tells each map by its origin', () => {
    expect(byId['X']?.origin).toBe('library');

    expect(byId['.1']?.origin).toBe('custom');

    expect(byId['~1']?.origin).toBe('cached');
  });

  it('prefers a custom map to an offline one of the same id', () => {
    expect(byId['.2']).toMatchObject({
      origin: 'custom',
      def: { layer: 'base' },
    });
  });

  it('gives a custom map the kind its setup switches it to', () => {
    expect(byId['.1']?.def?.layer).toBe('overlay');
  });

  it('names a library map by its entry', () => {
    expect(mapEntryOf(byId['X'])?.type).toBe('X');
  });
});
