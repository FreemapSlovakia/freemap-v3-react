import { UserSettingsCompatSchema } from '@features/auth/model/types.js';
import { describe, expect, it } from 'vitest';

const shading = {
  backgroundColor: [0, 0, 0, 0],
  components: [
    {
      id: 0.3,
      type: 'hillshade-igor',
      contrast: 1,
      brightness: 0,
      azimuth: 2.35,
      exaggeration: 1,
      colorStops: [{ value: 0, color: [0, 0, 0, 1] }],
    },
  ],
};

describe('legacy account settings', () => {
  it('moves a map’s opacity into its setup, keeping a setup’s own', () => {
    const settings = UserSettingsCompatSchema.parse({
      layersSettings: {
        s1: { opacity: 0.4, showInMenu: true },
        I: { opacity: 0.7 },
      },
      layerSetups: { I: { opacity: 0.2 } },
    });

    expect(settings.layerSetups).toEqual({
      s1: { opacity: 0.4 },
      I: { opacity: 0.2 },
    });

    expect(settings.layersSettings).toEqual({
      s1: { showInMenu: true },
      I: {},
    });
  });

  it('turns a custom shading map into a preset of the shading map', () => {
    const settings = UserSettingsCompatSchema.parse({
      customLayers: [
        {
          type: 'cwuytq',
          name: 'cca povodne',
          layer: 'overlay',
          zIndex: 1,
          technology: 'parametricShading',
          shading,
          source: 'h',
          url: 'https://example.com/{z}/{x}/{y}',
        },
      ],
      layersSettings: { cwuytq: { opacity: 0.5, showInToolbar: true } },
    });

    expect(settings.customLayers).toEqual([]);

    expect(settings.presets).toMatchObject([
      {
        id: 'cwuytq',
        name: 'cca povodne',
        opacity: 0.5,
        layers: [{ type: 'h', setup: { shading: { components: [{}] } } }],
      },
    ]);

    // Its toolbar setting stays under the same id.
    expect(settings.layersSettings).toEqual({
      cwuytq: { showInToolbar: true },
    });

    expect(settings.layerSetups).toEqual({});
  });

  it('turns a custom colour map into a preset of Solid colour', () => {
    const settings = UserSettingsCompatSchema.parse({
      customLayers: [
        {
          type: '9j7hvn',
          name: 'White',
          iconSpec: 'poi:animal_shelter',
          layer: 'base',
          technology: 'color',
          color: [255, 255, 255, 1],
        },
      ],
    });

    expect(settings.presets).toEqual([
      {
        id: '9j7hvn',
        name: 'White',
        iconSpec: 'poi:animal_shelter',
        layers: [{ type: 'c', setup: { color: [255, 255, 255, 1] } }],
      },
    ]);
  });
});
