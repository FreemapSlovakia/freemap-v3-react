import type { Bbox } from '@features/mapArea/model/actions.js';
import { describe, expect, it } from 'vitest';
import { type ElevationTile, neededTiles, sampleGrid } from './tileGrid.js';

const buffer = 2;

const side = 256 + 2 * buffer;

/** A tile whose height is the world pixel column at its centre. */
function rampTile(tx: number): ElevationTile {
  const data = new Float32Array(side * side);

  for (let y = 0; y < side; y++) {
    for (let x = 0; x < side; x++) {
      data[y * side + x] = tx * 256 + x - buffer + 0.5;
    }
  }

  return { data, side, buffer };
}

// One z1 world is 512 px; this box spans world pixels 128 to 384, across the
// tile boundary at 256.
const bbox: Bbox = [-90, -45, 90, 45];

describe('tile sampling', () => {
  it('names the tiles under the grid', () => {
    expect(neededTiles(bbox, 5, 5, 1)).toEqual([
      [0, 0],
      [1, 0],
      [0, 1],
      [1, 1],
    ]);
  });

  it('interpolates across a tile edge', () => {
    const h = sampleGrid(bbox, 5, 5, 1, (x) => rampTile(x));

    expect([...h.slice(0, 5)].map((v) => Math.round(v * 100) / 100)).toEqual([
      128, 192, 256, 320, 384,
    ]);
  });

  it('interpolates a grid finer than two pixels', () => {
    // 513 columns over 256 px: half a pixel apart.
    const h = sampleGrid(bbox, 513, 5, 1, (x) => rampTile(x));

    expect(h[0]).toBeCloseTo(128);
    expect(h[1]).toBeCloseTo(128.5);
  });

  it('averages a cell rather than point-sampling it', () => {
    // A cliff between world pixels 191 and 192, under the vertex at 192.
    const cliff = (): ElevationTile => {
      const data = new Float32Array(side * side);

      for (let i = 0; i < data.length; i++) {
        data[i] = (i % side) - buffer < 192 ? 0 : 100;
      }

      return { data, side, buffer };
    };

    const h = sampleGrid(bbox, 5, 5, 1, (x) =>
      x === 0 ? cliff() : rampTile(1),
    );

    expect(h[1]).toBeCloseTo(50);
  });

  it('keeps a ramp straight at a step of a fractional number of pixels', () => {
    // 2.3 px apart: whole-pixel counting alternated 2 and 3 pixels a cell,
    // which wobbled a ramp by up to half a pixel — the stripes.
    const cols = Math.round(256 / 2.3) + 1;

    const h = sampleGrid(bbox, cols, 5, 1, (x) => rampTile(x));

    const dx = 256 / (cols - 1);

    const worst = Math.max(
      ...Array.from({ length: cols }, (_, c) =>
        Math.abs(h[c]! - (128 + c * dx)),
      ),
    );

    expect(worst).toBeLessThan(0.1);
  });

  it('spaces rows evenly in latitude, not in Mercator', () => {
    // A tile whose height is the world pixel row at its centre.
    const rowRamp = (ty: number): ElevationTile => {
      const data = new Float32Array(side * side);

      for (let i = 0; i < data.length; i++) {
        data[i] = ty * 256 + Math.floor(i / side) - buffer + 0.5;
      }

      return { data, side, buffer };
    };

    // 0° to 60° in three rows: the middle one is at 30°, world row 211.2 at
    // z1; halfway in Mercator would be 202.3. Fine columns, so interpolated.
    const h = sampleGrid([-90, 0, 90, 60], 513, 3, 1, (_, y) => rowRamp(y));

    expect(h[513]).toBeCloseTo(211.2, 0);
  });

  it('leaves samples on a missing tile without data', () => {
    const h = sampleGrid(bbox, 5, 5, 1, (x) =>
      x === 0 ? rampTile(0) : undefined,
    );

    expect(h[0]).toBeCloseTo(128);
    expect(h[4]).toBeNaN();
  });
});
