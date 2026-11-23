import { describe, expect, it } from 'vitest';
import { MIN_MAX_ZOOM, UserSettingsCompatSchema } from './types.js';

describe('UserSettingsCompatSchema maxZoom', () => {
  const parse = (maxZoom: unknown) =>
    UserSettingsCompatSchema.parse({ maxZoom, presets: [] });

  it('raises a cap below the floor to the floor, keeping the rest', () => {
    expect(parse(0)).toEqual({ maxZoom: MIN_MAX_ZOOM, presets: [] });
  });

  it('keeps a cap at or above the floor', () => {
    expect(parse(19).maxZoom).toBe(19);
  });

  it('drops what is not a number', () => {
    expect(parse('x')).toEqual({ maxZoom: undefined, presets: [] });
  });
});
