import { describe, expect, it } from 'vitest';
import {
  distanceTransform,
  openClasses,
  type Paint,
  paintGrid,
} from './paint.js';

// 11 × 11 points over 10 × 10 mm: a point per millimetre.
const bbox = [17, 48, 17.1, 48.1] as [number, number, number, number];

const grid = (paint: Partial<Paint>) =>
  paintGrid(bbox, 11, 11, 10, 10, {
    palette: ['#ffffff', '#ff0000', '#0000ff'],
    landcover: [],
    landcoverDetailMm: 0,
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

  it('merges a thin gap between two patches into them', () => {
    // Two 4 mm wide blocks with a bare column between them.
    const block = (w: number, e: number) => [
      [
        [17 + w / 100, 48.11],
        [17 + e / 100, 48.11],
        [17 + e / 100, 47.99],
        [17 + w / 100, 47.99],
        [17 + w / 100, 48.11],
      ],
    ];

    const classes = grid({
      landcover: [
        { colour: 1, rings: block(0, 4.5) },
        { colour: 1, rings: block(5.5, 10) },
      ],
      landcoverDetailMm: 2,
    });

    expect(rowOf(classes, 3)).toBe('11111111111');
  });

  it('paints landcover under fills', () => {
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
      landcover: [{ colour: 2, rings: [ring(1.5, 8.5), ring(3.5, 6.5)] }],
      fills: [{ colour: 1, rings: [ring(4.5, 5.5)] }],
    });

    expect(rowOf(classes, 4)).toBe('00220002200');

    expect(rowOf(classes, 5)).toBe('00220102200');
  });

  it('opens a thin spur away, and a notch shut', () => {
    // A block in rows 4–8, a one-point-wide spur up from it, a notch into it.
    const g = new Uint8Array(81);

    for (let row = 4; row <= 8; row++) {
      g.fill(1, row * 9, row * 9 + 9);
    }

    for (let row = 0; row < 4; row++) {
      g[row * 9 + 4] = 1;
    }

    g[8 * 9 + 2] = 0;

    const out = openClasses(g, 9, 9, 1);

    // All but the root, where it meets the block.
    expect([...out.subarray(0, 27)].every((v) => v === 0)).toBe(true);

    expect(out[8 * 9 + 2]).toBe(1);
  });

  it('removes a blob narrower than the detail entirely, keeps a wider one', () => {
    const g = new Uint8Array(24 * 24);

    // 3 × 3, under the 4-point diameter.
    for (let row = 4; row < 7; row++) {
      g.fill(1, row * 24 + 4, row * 24 + 7);
    }

    // 8 × 6, over it.
    for (let row = 12; row < 18; row++) {
      g.fill(1, row * 24 + 8, row * 24 + 16);
    }

    const out = openClasses(g, 24, 24, 2);

    expect([...out.subarray(0, 12 * 24)].every((v) => v === 0)).toBe(true);

    // Whole but for its rounded corners.
    expect([...out.subarray(14 * 24, 15 * 24)].join('')).toBe(
      '000000001111111100000000',
    );

    expect(out[12 * 24 + 8]).toBe(0);

    expect(out[12 * 24 + 12]).toBe(1);
  });

  it('removes a strip along the edge as one inside', () => {
    const g = new Uint8Array(12 * 12);

    // Two points wide along the west edge, under the 4-point diameter.
    for (let row = 0; row < 12; row++) {
      g.fill(1, row * 12, row * 12 + 2);
    }

    expect(openClasses(g, 12, 12, 2).every((v) => v === 0)).toBe(true);
  });

  it('changes nothing with a radius under one point', () => {
    const g = new Uint8Array([0, 1, 0, 1, 0, 1, 0, 1, 0]);

    expect(openClasses(g, 3, 3, 0.9)).toBe(g);
  });

  it('finds the squared distance to the nearest site, and the site', () => {
    const sites = new Uint8Array(5 * 4);

    sites[0] = 1;

    sites[3 * 5 + 4] = 1;

    const { d2, near } = distanceTransform(sites, 5, 4);

    expect(d2[2 * 5 + 1]).toBe(5);

    expect(near[2 * 5 + 1]).toBe(0);

    expect(d2[2 * 5 + 4]).toBe(1);

    expect(near[2 * 5 + 4]).toBe(19);
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
