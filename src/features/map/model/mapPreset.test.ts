import { describe, expect, it } from 'vitest';
import { DEFAULT_SHADING } from './layerSetup.js';
import { mergeLayers } from './mapPreset.js';

const defaults = {
  kind: (type: string) =>
    type === 'X' ? ('base' as const) : ('overlay' as const),
  wmsLayers: (type: string) => (type === 'WKA' ? ['a', 'b'] : []),
};

describe('mergeLayers', () => {
  it('keeps a map drawn once as it is', () => {
    const layers = [
      { type: 'X', setup: {} },
      { type: 'xh', setup: { opacity: 0.5 } },
    ];

    expect(mergeLayers(layers, defaults)).toEqual(layers);
  });

  it("joins a WMS map's layers in its upper place, the lower's first", () => {
    expect(
      mergeLayers(
        [
          { type: 'WKA', setup: { wmsLayers: ['c'], opacity: 0.3 } },
          { type: 'xh', setup: {} },
          { type: 'WKA', setup: { opacity: 0.8 } },
        ],
        defaults,
      ),
    ).toEqual([
      { type: 'xh', setup: {} },
      { type: 'WKA', setup: { wmsLayers: ['c', 'a', 'b'], opacity: 0.8 } },
    ]);
  });

  it("stacks shading components on the lower one's background", () => {
    const [merged] = mergeLayers(
      [
        { type: 'h', setup: {} },
        {
          type: 'h',
          setup: {
            shading: { ...DEFAULT_SHADING, backgroundColor: [1, 2, 3, 1] },
          },
        },
      ],
      defaults,
    );

    expect(merged!.setup.shading?.backgroundColor).toEqual(
      DEFAULT_SHADING.backgroundColor,
    );

    expect(merged!.setup.shading?.components.map((c) => c.id)).toEqual([1, 2]);
  });

  it('a base drawing makes the merged map a base, at the bottom', () => {
    expect(
      mergeLayers(
        [
          { type: 'xh', setup: {} },
          { type: 'h', setup: { kind: 'base' } },
          { type: 'h', setup: {} },
        ],
        defaults,
      ).map((l) => [l.type, l.setup.kind]),
    ).toEqual([
      ['h', 'base'],
      ['xh', undefined],
    ]);
  });
});
