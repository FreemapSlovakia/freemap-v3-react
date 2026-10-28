import { describe, expect, it } from 'vitest';
import { parseShading, serializeShading } from './Shading.js';
import {
  isOpaquePreset,
  SHADING_PRESETS,
  shadingPreset,
} from './shadingPresets.js';

describe('shadingPreset serialization', () => {
  it.each(SHADING_PRESETS)('%s reads back as written', (preset) => {
    const s = serializeShading(shadingPreset(preset, () => 0));

    expect(serializeShading(parseShading(s))).toBe(s);
  });
});

describe('gradient on a single-colour type', () => {
  it.each([
    '00000000!slope-igor_2.0_0.000_9E959100_30.000_8A2408FF',
    '00000000!hillshade-classic~1.50~0.10_315.0_45.0_1.0_0.200_1C3C48FF_0.800_FFF0DCFF',
    '00000000!hillshade-igor_135.0_1.0_0.000_00000000_2.000_000000FF',
    '00000000!slope-classic_45.0_1.0_0.000_00000000_1.000_FF0000FF',
  ])('%s reads back as written', (s) => {
    expect(serializeShading(parseShading(s))).toBe(s);
  });

  it('keeps the colour of a link from before exaggeration', () => {
    const [c] = parseShading(
      '00000000!hillshade-igor_315.0_00000099',
    ).components;

    expect(c?.colorStops).toEqual([{ value: 0, color: [0, 0, 0, 0.6] }]);
  });

  it('gives a layer without a colour one stop', () => {
    const [c] = parseShading('00000000!slope-igor').components;

    expect(c?.colorStops).toHaveLength(1);
  });

  it.each([
    '00000000!curvature_1.0_-0.070_EED6B0FF_0.070_2E5866FF',
    '00000000!curvature_1.0_16_-0.070_EED6B0FF_0.070_2E5866FF',
  ])('%s reads back as written', (s) => {
    expect(serializeShading(parseShading(s))).toBe(s);
  });

  it('reads a curvature radius only where written', () => {
    const radius = (s: string) => {
      const [c] = parseShading(`00000000!curvature_1.0_${s}`).components;

      return c?.type === 'curvature' ? c.radius : undefined;
    };

    expect(radius('-0.070_EED6B0FF_0.070_2E5866FF')).toBe(2);

    expect(radius('16_-0.070_EED6B0FF_0.070_2E5866FF')).toBe(16);

    expect(radius('16')).toBe(16);
  });

  it.each([
    ['50', 32],
    ['0', 1],
    ['16.4', 16],
    ['x', 2],
  ])('brings radius %s to %s, as the server takes it', (r, expected) => {
    const [c] = parseShading(
      `00000000!curvature_1.0_${r}_-0.070_EED6B0FF_0.070_2E5866FF`,
    ).components;

    expect(c?.type === 'curvature' && c.radius).toBe(expected);
  });

  it('reads one colour as before', () => {
    const [c] = parseShading('00000000!slope-igor_2.0_8A2408FF').components;

    expect(c).toMatchObject({
      type: 'slope-igor',
      exaggeration: 2,
      colorStops: [{ value: 0, color: [0x8a, 0x24, 0x08, 1] }],
    });
  });
});

const background = (preset: Parameters<typeof shadingPreset>[0], bg: boolean) =>
  shadingPreset(preset, () => 0, undefined, bg).backgroundColor;

describe('shadingPreset background', () => {
  it('puts white under a preset without one only when asked', () => {
    expect(background('shadow', true)).toEqual([255, 255, 255, 1]);

    expect(background('shadow', false)[3]).toBe(0);
  });

  it('keeps an optional background only when asked', () => {
    expect(background('glacier', true)).toEqual([0xff, 0xff, 0xff, 1]);

    expect(background('plastic', true)).toEqual([0x80, 0x80, 0x80, 1]);

    expect(background('plastic', false)[3]).toBe(0);

    expect(isOpaquePreset('plastic')).toBe(false);
  });

  it('always keeps a background the look depends on', () => {
    expect(background('classic', false)).toEqual([0, 0, 0, 1]);

    expect(isOpaquePreset('classic')).toBe(true);
  });

  it('adds nothing under an opaque colour relief', () => {
    expect(background('autumn', true)[3]).toBe(0);

    expect(isOpaquePreset('autumn')).toBe(true);
  });
});
