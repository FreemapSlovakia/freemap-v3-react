import {
  ELEVATION_API_DTM_ATTRIBUTION,
  ELEVATION_API_DTM_COUNTRIES,
  elevationSourcesFromTokens,
  hasSubMeterPrecision,
} from '@shared/elevationSources.js';
import { describe, expect, it } from 'vitest';

// Stands in for `Intl.DisplayNames`, which the caller supplies.
const regionName = (country: string) =>
  ({ pt: 'Portugal' })[country.toLowerCase()];

const tokenNames = (tokens: string[]) =>
  elevationSourcesFromTokens(tokens, regionName).map((attr) => attr.name);

describe('ELEVATION_API_DTM_ATTRIBUTION', () => {
  it('credits a national model for every country the API serves one for', () => {
    expect(ELEVATION_API_DTM_ATTRIBUTION.map((attr) => attr.country).sort()) //
      .toEqual([...ELEVATION_API_DTM_COUNTRIES].sort());
  });

  it('names and links every source it credits', () => {
    for (const attr of ELEVATION_API_DTM_ATTRIBUTION) {
      expect(attr.name).toBeTruthy();

      expect(attr.url).toBeTruthy();
    }
  });
});

describe('elevationSourcesFromTokens', () => {
  it('credits a country code with that country’s national model', () => {
    expect(tokenNames(['sk'])).toEqual(['DMR 5.0: ÚGKK SR']);
  });

  it('credits the global model last, whatever order it was reported in', () => {
    expect(tokenNames(['gedtm30', 'sk'])).toEqual([
      'DMR 5.0: ÚGKK SR',
      'GEDTM30',
    ]);
  });

  it('orders the national models by the table, not by the report', () => {
    expect(tokenNames(['sk', 'at'])).toEqual([
      'ALS DTM: Digitales Geländemodell Österreich (Geoland.at open data)',
      'DMR 5.0: ÚGKK SR',
    ]);
  });

  it('ignores duplicates', () => {
    expect(tokenNames(['sk', 'sk', 'gedtm30', 'gedtm30'])).toEqual([
      'DMR 5.0: ÚGKK SR',
      'GEDTM30',
    ]);
  });

  it('credits a country it has no entry for under its localized name', () => {
    expect(tokenNames(['pt'])).toEqual(['Portugal']);

    expect(
      elevationSourcesFromTokens(['pt'], regionName)[0]?.url,
    ).toBeUndefined();
  });

  it('falls back to the raw token for an unknown non-country model', () => {
    expect(tokenNames(['eudem'])).toEqual(['eudem']);
  });

  it('credits the router’s own model, which the API never reports', () => {
    expect(tokenNames(['sonny'])).toEqual(["Sonny's LiDAR DTM"]);
  });

  it('credits every global model, in registry order, after the national ones', () => {
    expect(tokenNames(['srtm', 'sonny', 'gedtm30', 'sk'])).toEqual([
      'DMR 5.0: ÚGKK SR',
      'GEDTM30',
      "Sonny's LiDAR DTM",
      'SRTM',
    ]);
  });

  it('reads a token whatever its case', () => {
    expect(tokenNames(['SK', 'GEDTM30'])).toEqual([
      'DMR 5.0: ÚGKK SR',
      'GEDTM30',
    ]);
  });

  // `Intl.DisplayNames.of` throws on a region code that is neither two letters
  // nor three digits, so only a real country code may reach it.
  it('never offers a malformed token to the region namer', () => {
    const namer = () => {
      throw new RangeError('invalid region code');
    };

    expect(elevationSourcesFromTokens(['s1'], namer).map((a) => a.name)) //
      .toEqual(['s1']);
  });

  it('credits nothing when nothing was reported', () => {
    expect(tokenNames([])).toEqual([]);
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
