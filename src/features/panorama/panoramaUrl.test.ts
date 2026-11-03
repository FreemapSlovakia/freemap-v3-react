import { describe, expect, it } from 'vitest';
import { panoramaSettingsInitialState } from './model/settingsReducer.js';
import {
  parsePanoramaDate,
  parsePanoramaSky,
  serializePanoramaSky,
} from './panoramaUrl.js';

describe('panorama-sky', () => {
  const sky = (showSun: boolean, showMoon: boolean) =>
    serializePanoramaSky({
      ...panoramaSettingsInitialState,
      showSun,
      showMoon,
    });

  it('is not written for the default', () => {
    expect(sky(true, false)).toBeNull();
  });

  it('round-trips every other choice', () => {
    for (const [showSun, showMoon] of [
      [true, true],
      [false, true],
      [false, false],
    ] as const) {
      expect(parsePanoramaSky(sky(showSun, showMoon)!)).toEqual({
        showSun,
        showMoon,
      });
    }
  });

  it('refuses anything else', () => {
    expect(parsePanoramaSky('')).toBeNull();
    expect(parsePanoramaSky('sun,stars')).toBeNull();
  });
});

describe('panorama-date', () => {
  it('takes a real day', () => {
    expect(parsePanoramaDate('2026-10-14')).toBe('2026-10-14');
    expect(parsePanoramaDate('2028-02-29')).toBe('2028-02-29');
  });

  it('refuses a day that does not exist or a half-typed year', () => {
    expect(parsePanoramaDate('2026-02-31')).toBeNull();
    expect(parsePanoramaDate('2026-13-01')).toBeNull();
    expect(parsePanoramaDate('0202-10-14')).toBeNull();
    expect(parsePanoramaDate('2026-10-14x')).toBeNull();
    expect(parsePanoramaDate('')).toBeNull();
  });
});
