import {
  ELEVATION_API_DTM_ATTRIBUTION,
  ELEVATION_API_DTM_COUNTRIES,
  hasSubMeterPrecision,
} from '@shared/elevationSources.js';
import { describe, expect, it } from 'vitest';

describe('ELEVATION_API_DTM_ATTRIBUTION', () => {
  it('credits a national model for every country the API serves one for', () => {
    expect(
      [...new Set(ELEVATION_API_DTM_ATTRIBUTION.map((attr) => attr.country))] //
        .sort(),
    ).toEqual([...ELEVATION_API_DTM_COUNTRIES].sort());
  });

  it('names and links every source it credits', () => {
    for (const attr of ELEVATION_API_DTM_ATTRIBUTION) {
      expect(attr.name).toBeTruthy();

      expect(attr.url).toBeTruthy();
    }
  });
});

describe('hasSubMeterPrecision', () => {
  it('holds for a national model, whatever its case', () => {
    expect(hasSubMeterPrecision(['sk'])).toBe(true);
    expect(hasSubMeterPrecision(['SK'])).toBe(true);
  });

  it('does not hold for a global model, nor beside a national one', () => {
    expect(hasSubMeterPrecision(['srtm'])).toBe(false);
    expect(hasSubMeterPrecision(['gedtm30'])).toBe(false);
    expect(hasSubMeterPrecision(['sonny'])).toBe(false);
    expect(hasSubMeterPrecision(['sk', 'gedtm30'])).toBe(false);
  });

  it('does not hold when nothing was reported', () => {
    expect(hasSubMeterPrecision([])).toBe(false);
  });
});
