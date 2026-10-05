import { describe, expect, it } from 'vitest';
import {
  parsePresetParams,
  parseSetup,
  presetUrlParts,
  sameInLink,
  serializeSetup,
} from './layerSetupUrl.js';
import { adoptPresets, inlinePresets, type MapPreset } from './mapPreset.js';

const preset: MapPreset = {
  id: 'abc123',
  name: 'Cadastre; over aerial',
  iconSpec: 'fa:map',
  opacity: 0.6,
  layers: [
    { type: 'S', setup: {} },
    {
      type: 'WKA',
      setup: { kind: 'overlay', opacity: 0.5, wmsLayers: ['a,b', 'c'] },
    },
  ],
};

describe('layer setups in links', () => {
  it('reads back what it writes', () => {
    const setup = preset.layers[1]!.setup;

    expect(parseSetup(serializeSetup(setup))).toEqual(setup);
  });

  it('carries a preset whole', () => {
    const query = Object.fromEntries(presetUrlParts(preset, '1'));

    expect(parsePresetParams(query, '1')).toEqual({ ...preset, id: '1' });

    expect(parsePresetParams(query, '2')).toBeUndefined();
  });

  it("stands for the account's own preset where alike, else is the link's", () => {
    const { layers, presets } = inlinePresets(['@abc123', 'xh'], (id) =>
      id === preset.id ? preset : undefined,
    );

    expect(layers).toEqual(['@1', 'xh']);

    const own = adoptPresets(layers, presets, [preset], '', sameInLink);

    expect(own).toEqual({ layers: ['@abc123', 'xh'], linkPresets: [] });

    const changed = adoptPresets(
      layers,
      presets,
      [{ ...preset, opacity: 0.2 }],
      '',
      sameInLink,
    );

    expect(changed.layers).toEqual(['@~1', 'xh']);

    expect(changed.linkPresets).toEqual([{ ...preset, id: '~1' }]);
  });
});
