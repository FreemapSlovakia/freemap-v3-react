import { formatArea, naturalAreaUnit } from '@shared/areaFormatter.js';
import { describe, expect, it } from 'vitest';

describe('naturalAreaUnit', () => {
  it('steps at a hectare and at a square kilometre', () => {
    expect(naturalAreaUnit(500)).toBe('m²');
    expect(naturalAreaUnit(50_000)).toBe('ha');
    expect(naturalAreaUnit(5_000_000)).toBe('km²');
  });

  it('steps up where rounding crosses the threshold', () => {
    expect(naturalAreaUnit(9999.6)).toBe('ha');
    expect(naturalAreaUnit(999_960)).toBe('km²');
  });
});

describe('formatArea', () => {
  it('writes three significant digits and the unit symbol', () => {
    expect(formatArea(12_345, 'ha', 'en')).toBe('1.23 ha');
    expect(formatArea(9_999_000, 'm²', 'en')).toBe('9,999,000 m²');
  });
});
