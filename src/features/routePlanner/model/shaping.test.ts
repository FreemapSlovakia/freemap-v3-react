import { describe, expect, it } from 'vitest';
import {
  isShaping,
  stretchBounds,
  turnBacks,
  waypointNumber,
} from './shaping.js';

// Start, shaping, real, shaping, shaping, finish.
const points = [
  {},
  { shaping: true },
  {},
  { shaping: true },
  { shaping: true },
  {},
];

describe('isShaping', () => {
  it('holds for inner points of a route in order only', () => {
    expect(points.map((_, i) => isShaping(points, i, 'route'))).toEqual([
      false,
      true,
      false,
      true,
      true,
      false,
    ]);

    expect(isShaping(points, 1, 'trip')).toBe(false);
  });

  it('never holds for an end', () => {
    const ends = [{ shaping: true }, { shaping: true }];

    expect(isShaping(ends, 0, 'route')).toBe(false);

    expect(isShaping(ends, 1, 'route')).toBe(false);
  });
});

describe('stretchBounds', () => {
  it('joins the legs across shaping points', () => {
    expect(stretchBounds(points, 'route', 0)).toEqual([0, 1]);

    expect(stretchBounds(points, 'route', 1)).toEqual([0, 1]);

    expect(stretchBounds(points, 'route', 3)).toEqual([2, 4]);
  });

  it('keeps a leg alone outside route mode', () => {
    expect(stretchBounds(points, 'trip', 3)).toEqual([3, 3]);
  });
});

describe('waypointNumber', () => {
  it('counts the real waypoints', () => {
    expect(waypointNumber(points, 2, 'route')).toBe(1);

    expect(waypointNumber(points, 5, 'route')).toBe(2);

    expect(waypointNumber(points, 2, 'trip')).toBe(2);
  });
});

describe('turnBacks', () => {
  // ~1.1 m per 0.00001°; the shaping point sits at [20, 49].
  const leg = (...coords: [number, number][]) => ({
    steps: [{ geometry: { coordinates: coords } }],
  });

  const east = (m: number): [number, number] => [20 + m / 73_000, 49];

  const north = (m: number): [number, number] => [20, 49 + m / 111_000];

  const route = [{}, { shaping: true }, {}];

  const arriving = leg(north(-200), north(0));

  it('finds a route leaving the way it came', () => {
    expect(
      turnBacks(route, 'route', [arriving, leg(north(0), north(-150))]),
    ).toEqual(new Set([1]));
  });

  it('passes a turn, a straight on and a hairpin of parallel roads', () => {
    for (const leaving of [
      leg(north(0), east(150)),
      leg(north(0), north(150)),
      leg(north(0), east(12), [20 + 12 / 73_000, 49 - 150 / 111_000]),
    ]) {
      expect(turnBacks(route, 'route', [arriving, leaving])).toEqual(new Set());
    }
  });

  it('leaves real waypoints and stale legs alone', () => {
    const back = leg(north(0), north(-150));

    expect(turnBacks([{}, {}, {}], 'route', [arriving, back])).toEqual(
      new Set(),
    );

    expect(turnBacks(route, 'route', [arriving])).toEqual(new Set());
  });
});
