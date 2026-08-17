import { describe, expect, it } from 'vitest';
import { parseTolerance } from './simplifyPrompt.js';
import { TOLERANCE_UNIT } from './simplifyTolerance.js';

describe('parseTolerance', () => {
  it('reads the factor in the prompt unit', () => {
    expect(parseTolerance('50')).toBe(50 / TOLERANCE_UNIT);

    expect(parseTolerance(' 50 ')).toBe(50 / TOLERANCE_UNIT);
  });

  it('reads a comma as the decimal point', () => {
    expect(parseTolerance('12,5')).toBe(12.5 / TOLERANCE_UNIT);
  });

  it('takes an empty answer as no simplification', () => {
    expect(parseTolerance('')).toBe(0);
  });

  it('refuses what is not a factor — `simplify` throws on those', () => {
    expect(parseTolerance('-50')).toBeNull();

    expect(parseTolerance('none')).toBeNull();

    expect(parseTolerance('1e999')).toBeNull();
  });
});
