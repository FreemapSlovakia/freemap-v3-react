import { describe, expect, it } from 'vitest';
import { gustScale, thunderHazard, thunderLevel } from './hazard.js';

const kmh = (v: number) => v / 3.6;

describe('gustScale', () => {
  it('is grey below 45 km/h, amber by 60, red by 100, dangerous from 90', () => {
    expect(gustScale(null)).toBeNull();

    expect(gustScale(kmh(44))).toBeNull();

    const amber = gustScale(kmh(60));

    expect(amber?.colour).toBe(1);

    expect(amber?.red).toBeCloseTo(0);

    expect(amber?.dangerous).toBe(false);

    expect(gustScale(kmh(90))?.dangerous).toBe(true);

    expect(gustScale(kmh(120))?.red).toBe(1);
  });
});

describe('thunder', () => {
  it('grades CAPE and colours only moderate and high', () => {
    expect(thunderLevel(200)).toBeNull();

    expect(thunderLevel(500)).toBe('low');

    expect(thunderHazard(thunderLevel(500))).toBeNull();

    expect(thunderHazard(thunderLevel(1500))).toBe('warning');

    expect(thunderHazard(thunderLevel(3000))).toBe('danger');
  });
});
