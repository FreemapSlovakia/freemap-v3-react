import { describe, expect, it } from 'vitest';
import {
  type ColorizedAtDistance,
  stopAtDistance,
} from './hooks/useChartColorize.js';

const stop = (distance: number, color: number, gap = false) =>
  ({ distance, color, gap }) satisfies ColorizedAtDistance;

const colorAt = (stops: ColorizedAtDistance[], distance: number) =>
  stopAtDistance(stops, distance)?.color;

describe('stopAtDistance', () => {
  it('takes the nearer of the stops around a distance', () => {
    expect(colorAt([stop(0, 0.1), stop(100, 0.9)], 25)).toBe(0.1);
    expect(colorAt([stop(0, 0.1), stop(100, 0.9)], 75)).toBe(0.9);
  });

  it('does not wrap through the palette between headings either side of north', () => {
    expect(colorAt([stop(0, 0.997), stop(10, 0.003)], 4)).toBe(0.997);
  });

  it('takes the stop itself at its own distance', () => {
    expect(colorAt([stop(0, 0.2), stop(100, 0.6)], 0)).toBe(0.2);
  });

  it('takes the end stop just past the end of the line', () => {
    expect(colorAt([stop(0, 0.2), stop(100, 0.6)], 103)).toBe(0.6);
  });

  it('has no value in a gap or past a trailing gap', () => {
    const stops = [
      stop(0, 0),
      stop(50, 0.5),
      stop(50, 0, true),
      stop(80, 0, true),
    ];

    expect(colorAt(stops, 60)).toBeUndefined();
    expect(colorAt(stops, 200)).toBeUndefined();
  });
});
