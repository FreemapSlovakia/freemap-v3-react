import { describe, expect, it } from 'vitest';
import { isOpaquePreset, shadingPreset } from './shadingPresets.js';

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
