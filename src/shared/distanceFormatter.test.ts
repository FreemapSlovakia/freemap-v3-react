import { measurementFractionDigits } from '@shared/areaFormatter.js';
import { formatDistance } from '@shared/distanceFormatter.js';
import { describe, expect, it } from 'vitest';

// `Intl` joins a value to its unit with a non-breaking space in some locales.
const formatted = (meters: number) =>
  formatDistance(meters, 'en').replace(/ /g, ' ');

describe('measurementFractionDigits', () => {
  it('keeps three significant digits', () => {
    expect(measurementFractionDigits(1.234)).toBe(2);
    expect(measurementFractionDigits(12.34)).toBe(1);
    expect(measurementFractionDigits(123.4)).toBe(0);
    expect(measurementFractionDigits(1234)).toBe(0);
    expect(measurementFractionDigits(0.1234)).toBe(3);
  });

  it('counts them from the rounded value', () => {
    expect(measurementFractionDigits(9.999)).toBe(1);
    expect(measurementFractionDigits(99.99)).toBe(0);
    expect(measurementFractionDigits(0.9996)).toBe(2);
  });

  it('gives a power of ten no digit more than any other value', () => {
    expect(measurementFractionDigits(1)).toBe(2);
    expect(measurementFractionDigits(10)).toBe(1);
    expect(measurementFractionDigits(100)).toBe(0);
  });

  it('answers for zero', () => {
    expect(measurementFractionDigits(0)).toBe(2);
  });
});

describe('formatDistance', () => {
  it('writes three significant digits in metres and kilometres', () => {
    expect(formatted(3.42)).toBe('3.42 m');
    expect(formatted(523.4)).toBe('523 m');
    expect(formatted(1234)).toBe('1.23 km');
    expect(formatted(12345)).toBe('12.3 km');
    expect(formatted(123456)).toBe('123 km');
  });

  it('takes the unit from the rounded value', () => {
    expect(formatted(999.4)).toBe('999 m');
    expect(formatted(999.9)).toBe('1.00 km');
    expect(formatted(1000)).toBe('1.00 km');
  });

  it('does not gain a digit where rounding crosses a decade', () => {
    expect(formatted(9999)).toBe('10.0 km');
    expect(formatted(99999)).toBe('100 km');
  });
});
