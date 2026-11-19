import { describe, expect, it } from 'vitest';
import {
  buildMesh,
  meshToStl,
  meshTriangles,
  type StlOptions,
  stlBytes,
} from './stl.js';

const buildStl = (
  heights: Float32Array,
  options: StlOptions,
  classes?: Uint8Array,
) => {
  const mesh = buildMesh(heights, options, classes);

  return {
    data: meshToStl(mesh),
    triangles: meshTriangles(mesh),
    bytes: stlBytes(mesh),
    heightMm: mesh.heightMm,
  };
};

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

        expect(stl.bytes).toBe(stl.data.byteLength);
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

describe('a coloured mesh', () => {
  // A diagonal band in colour 1, a corner in colour 2.
  const classes = Uint8Array.from({ length: cols * rows }, (_, i) => {
    const x = i % cols;
    const y = Math.floor(i / cols);

    return Math.abs(x - y - 5) < 2 ? 1 : x > 26 && y > 14 ? 2 : 0;
  });

  const classAt = (mesh: ReturnType<typeof buildMesh>, v: number) => {
    const col = Math.round(mesh.positions[v * 3]! / (64 / (cols - 1)));
    const row =
      rows - 1 - Math.round(mesh.positions[v * 3 + 1]! / (40 / (rows - 1)));

    return classes[row * cols + col]!;
  };

  for (const toleranceMm of [0, 5]) {
    describe(`at tolerance ${toleranceMm} mm`, () => {
      const mesh = buildMesh(heights, { ...options, toleranceMm }, classes);

      it('stays closed', () => {
        expect(isClosed(triangles(meshToStl(mesh)))).toBe(true);
      });

      it('has a colour per triangle, walls and bottom the ground', () => {
        expect(mesh.colours).toHaveLength(meshTriangles(mesh));

        expect(
          mesh.colours!.subarray(mesh.topTriangles).every((c) => c === 0),
        ).toBe(true);

        expect(new Set(mesh.colours)).toEqual(new Set([0, 1, 2]));
      });

      it('colours a triangle as its vertices agree', () => {
        for (let t = 0; t < mesh.topTriangles; t++) {
          const [a, b, c] = [0, 1, 2].map((k) =>
            classAt(mesh, mesh.index[t * 3 + k]!),
          );

          expect(mesh.colours![t]).toBe(b === c ? b : a);
        }
      });
    });
  }

  it('splits simplified triangles down to the grid along colour edges', () => {
    const mesh = buildMesh(heights, { ...options, toleranceMm: 5 }, classes);

    const p = mesh.positions;

    const cell = (64 / (cols - 1)) * (40 / (rows - 1));

    for (let t = 0; t < mesh.topTriangles; t++) {
      const [a, b, c] = [0, 1, 2].map((k) => mesh.index[t * 3 + k]!);

      if (
        classAt(mesh, a) === classAt(mesh, b) &&
        classAt(mesh, b) === classAt(mesh, c)
      ) {
        continue;
      }

      const area = Math.abs(
        (p[b * 3]! - p[a * 3]!) * (p[c * 3 + 1]! - p[a * 3 + 1]!) -
          (p[c * 3]! - p[a * 3]!) * (p[b * 3 + 1]! - p[a * 3 + 1]!),
      );

      // No grid point but its vertices: half a cell, by Pick's theorem.
      expect(area / 2).toBeCloseTo(cell / 2);
    }

    const plain = buildMesh(heights, { ...options, toleranceMm: 5 });

    expect(mesh.topTriangles).toBeGreaterThan(plain.topTriangles);

    expect(mesh.topTriangles).toBeLessThan((cols - 1) * (rows - 1) * 2);
  });
});
