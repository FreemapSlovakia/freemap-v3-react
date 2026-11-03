import { describe, expect, it } from 'vitest';
import { mergeLayers, presetLayers } from './mapPreset.js';

const nativeKind = (type: string) =>
  type === 'X' ? ('base' as const) : ('overlay' as const);

describe('mergeLayers', () => {
  it('keeps a map drawn once as it is', () => {
    const layers = [
      { type: 'X', setup: {} },
      { type: 'xh', setup: { opacity: 0.5 } },
    ];

    expect(mergeLayers(layers, nativeKind)).toEqual(layers);
  });

  it('keeps a map drawn twice once, in its upper place, with its upper opacity', () => {
    expect(
      mergeLayers(
        [
          { type: 'WKA', setup: { opacity: 0.3 } },
          { type: 'xh', setup: {} },
          { type: 'WKA', setup: { opacity: 0.8 } },
        ],
        nativeKind,
      ),
    ).toEqual([
      { type: 'xh', setup: {} },
      { type: 'WKA', setup: { opacity: 0.8 } },
    ]);
  });

  it('a base drawing makes the merged map a base, at the bottom', () => {
    expect(
      mergeLayers(
        [
          { type: 'xh', setup: {} },
          { type: 'h', setup: { kind: 'base' } },
          { type: 'h', setup: {} },
        ],
        nativeKind,
      ).map((l) => [l.type, l.setup.kind]),
    ).toEqual([
      ['h', 'base'],
      ['xh', undefined],
    ]);
  });
});

describe('presetLayers', () => {
  it('keeps only what a preset’s copy has of its own: opacity and kind', () => {
    expect(
      presetLayers({
        layers: [
          { type: 'WKA', setup: { opacity: 0.5, wmsLayers: ['a'] } },
          { type: 'c', setup: { kind: 'overlay', color: [1, 2, 3, 1] } },
        ],
      }),
    ).toEqual([
      { type: 'WKA', setup: { opacity: 0.5 } },
      { type: 'c', setup: { kind: 'overlay' } },
    ]);
  });
});
