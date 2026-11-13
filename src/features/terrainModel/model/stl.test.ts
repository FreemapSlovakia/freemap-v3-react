import { describe, expect, it } from 'vitest';
import { buildStl, type StlOptions } from './stl.js';

function triangles(data: ArrayBuffer): number[][][] {
  const view = new DataView(data);

  const n = view.getUint32(80, true);

  return Array.from({ length: n }, (_, t) =>
    [0, 1, 2].map((v) =>
      [0, 1, 2].map((c) =>
        view.getFloat32(84 + t * 50 + 12 + v * 12 + c * 4, true),
      ),
    ),
  );
}

function isClosed(tris: number[][][]): boolean {
  const edges = new Map<string, number>();

  for (const [a, b, c] of tris) {
    for (const [p, q] of [
      [a, b],
      [b, c],
      [c, a],
    ]) {
      const key = `${p!.join()}|${q!.join()}`;

      edges.set(key, (edges.get(key) ?? 0) + 1);
    }
  }

  return [...edges].every(([edge, count]) => {
    const [p, q] = edge.split('|');

    return count === 1 && edges.get(`${q}|${p}`) === 1;
  });
}

function volume(tris: number[][][]): number {
  return (
    tris.reduce((sum, [a, b, c]) => {
      const [ax, ay, az] = a!;
      const [bx, by, bz] = b!;
      const [cx, cy, cz] = c!;

      return (
        sum +
        ax! * (by! * cz! - bz! * cy!) -
        ay! * (bx! * cz! - bz! * cx!) +
        az! * (bx! * cy! - by! * cx!)
      );
    }, 0) / 6
  );
}

const cols = 33;

const rows = 21;

// A ridge with some noise, and a hole without data.
const heights = Float32Array.from({ length: cols * rows }, (_, i) => {
  const x = i % cols;
  const y = Math.floor(i / cols);

  return x > 3 && x < 7 && y > 3 && y < 6
    ? Number.NaN
    : 100 + 40 * Math.exp(-((x - 16) ** 2) / 30) + ((x * 7 + y * 13) % 5);
});

const options: StlOptions = {
  cols,
  rows,
  widthMm: 64,
  depthMm: 40,
  mmPerM: 0.1,
  exaggeration: 2,
  baseMm: 3,
  toleranceMm: 0,
};

describe('buildStl', () => {
  for (const toleranceMm of [0, 0.5, 5]) {
    describe(`at tolerance ${toleranceMm} mm`, () => {
      const stl = buildStl(heights, { ...options, toleranceMm });

      const tris = triangles(stl.data);

      it('writes the declared number of triangles', () => {
        expect(tris).toHaveLength(stl.triangles);

        expect(stl.data.byteLength).toBe(84 + stl.triangles * 50);
      });

      it('is closed: every edge shared by two faces, in opposite directions', () => {
        expect(isClosed(tris)).toBe(true);
      });

      it('faces outwards, enclosing at least the base slab', () => {
        expect(volume(tris)).toBeGreaterThan(64 * 40 * 3);
      });
    });
  }

  it('simplifies within the tolerance', () => {
    const exact = buildStl(heights, options).triangles;

    const coarse = buildStl(heights, { ...options, toleranceMm: 5 }).triangles;

    expect(coarse).toBeLessThan(exact / 4);
  });

  it('puts the highest sample at base + relief', () => {
    const max = Math.max(...heights.filter((h) => !Number.isNaN(h)));

    const min = Math.min(...heights.filter((h) => !Number.isNaN(h)));

    expect(buildStl(heights, options).heightMm).toBeCloseTo(
      3 + (max - min) * 0.1 * 2,
    );
  });
});
