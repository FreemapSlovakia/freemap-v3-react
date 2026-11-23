import { describe, expect, it } from 'vitest';
import { type ForecastStep, overTerrain } from './forecast.js';

const hour = (h: number, sunshine: number | null) =>
  ({
    time: new Date(Date.UTC(2026, 10, 24, h)),
    hours: 1,
    sunshine,
  }) as ForecastStep;

const at = (h: number, m: number) => new Date(Date.UTC(2026, 10, 24, h, m));

describe('overTerrain', () => {
  const steps = [hour(7, 60), hour(8, 60), hour(13, 60), hour(14, 60)];

  it('holds sunshine to the minutes the sun is over the terrain', () => {
    const held = overTerrain(steps, at(8, 33), at(13, 50), false);

    expect(held.map((s) => s.sunshine)).toEqual([0, 27, 50, 0]);
  });

  it('leaves less sunshine than that, and unknown sunshine, alone', () => {
    const cloudy = [hour(8, 10), hour(9, null)];

    expect(overTerrain(cloudy, at(8, 33), at(13, 50), false)).toEqual(cloudy);
  });

  it('has none on a day the terrain hides the sun', () => {
    expect(
      overTerrain(steps, null, null, true).every((s) => s.sunshine === 0),
    ).toBe(true);
  });
});
