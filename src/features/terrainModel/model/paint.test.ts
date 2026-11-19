import { describe, expect, it } from 'vitest';
import { type Paint, paintGrid } from './paint.js';

// 11 × 11 points over 10 × 10 mm: a point per millimetre.
const bbox = [17, 48, 17.1, 48.1] as [number, number, number, number];

const grid = (paint: Partial<Paint>) =>
  paintGrid(bbox, 11, 11, 10, 10, {
    palette: ['#ffffff', '#ff0000', '#0000ff'],
    fills: [],
    lines: [],
    points: [],
    lineWidthMm: 2.5,
    pointSizeMm: 3,
    ...paint,
  });

const rowOf = (classes: Uint8Array, row: number) =>
  [...classes.subarray(row * 11, row * 11 + 11)].join('');

describe('paintGrid', () => {
  it('paints the points within half the width of a line', () => {
    // West to east along the middle row (latitude 48.05).
    const classes = grid({
      lines: [
        {
          colour: 1,
          coords: [
            [17.02, 48.05],
            [17.08, 48.05],
          ],
        },
      ],
    });

    expect(rowOf(classes, 5)).toBe('01111111110');

    expect(rowOf(classes, 4)).toBe('00111111100');

    expect(rowOf(classes, 6)).toBe('00111111100');

    expect(rowOf(classes, 3)).toBe('00000000000');
  });

  it('counts rows from the north', () => {
    const classes = grid({
      pointSizeMm: 1,
      points: [{ colour: 1, coords: [17.05, 48.1] }],
    });

    expect(classes[5]).toBe(1);

    expect(classes[10 * 11 + 5]).toBe(0);
  });

  it('paints a point as a disc of its diameter', () => {
    const classes = grid({ points: [{ colour: 2, coords: [17.05, 48.05] }] });

    expect(rowOf(classes, 5)).toBe('00002220000');

    expect(rowOf(classes, 4)).toBe('00002220000');

    expect(rowOf(classes, 3)).toBe('00000000000');
  });

  it('fills an area even-odd, a hole left out', () => {
    // A square from `lo` to `hi` mm off the west and north edges.
    const ring = (lo: number, hi: number) => {
      const w = 17 + lo / 100;
      const e = 17 + hi / 100;
      const n = 48.1 - lo / 100;
      const s = 48.1 - hi / 100;

      return [
        [w, n],
        [e, n],
        [e, s],
        [w, s],
        [w, n],
      ];
    };

    const classes = grid({
      fills: [{ colour: 1, rings: [ring(1.5, 8.5), ring(3.5, 6.5)] }],
    });

    expect(rowOf(classes, 5)).toBe('00110001100');

    expect(rowOf(classes, 2)).toBe('00111111100');

    expect(rowOf(classes, 1)).toBe('00000000000');
  });

  it('paints lines over fills, and points over both', () => {
    const classes = grid({
      fills: [
        {
          colour: 1,
          rings: [
            [
              [17, 48],
              [17.1, 48],
              [17.1, 48.1],
              [17, 48.1],
              [17, 48],
            ],
          ],
        },
      ],
      lines: [
        {
          colour: 2,
          coords: [
            [17, 48.05],
            [17.1, 48.05],
          ],
        },
      ],
      lineWidthMm: 1,
      points: [{ colour: 0, coords: [17.05, 48.05] }],
      pointSizeMm: 1,
    });

    expect(rowOf(classes, 5)).toBe('22222022222');

    expect(rowOf(classes, 3)).toBe('11111111111');
  });
});
