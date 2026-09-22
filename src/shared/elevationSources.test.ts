import { hasSubMeterPrecision } from '@shared/elevationSources.js';
import { describe, expect, it } from 'vitest';

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
