import Delatin from 'delatin';
import { NoElevationDataError } from './errors.js';

export interface StlOptions {
  cols: number;
  rows: number;
  widthMm: number;
  depthMm: number;
  /** Model millimetres per ground metre, before exaggeration. */
  mmPerM: number;
  exaggeration: number;
  /** Solid under the lowest point, millimetres. */
  baseMm: number;
  /** Largest height error a simplified surface may make, millimetres; 0 keeps every sample. */
  toleranceMm: number;
}

interface Triangulation {
  /** Vertex grid positions, `col, row` pairs. */
  coords: ArrayLike<number>;
  /** Vertex indices, three per triangle, in any winding. */
  triangles: ArrayLike<number>;
}

function simplified(
  heights: Float32Array,
  cols: number,
  rows: number,
  maxError: number,
): Triangulation {
  const tin = new Delatin(heights, cols, rows);

  tin.run(maxError);

  return tin;
}

/**
 * A triangulation's boundary vertices, counter-clockwise seen from above with
 * row 0 the north edge: south edge west to east, east edge south to north,
 * north edge east to west, west edge north to south.
 */
export function perimeterRing(
  coords: ArrayLike<number>,
  cols: number,
  rows: number,
): number[] {
  const vertices = coords.length / 2;

  const side = (pick: (col: number, row: number) => number | undefined) => {
    const found: [number, number][] = [];

    for (let v = 0; v < vertices; v++) {
      const key = pick(coords[2 * v]!, coords[2 * v + 1]!);

      if (key !== undefined) {
        found.push([key, v]);
      }
    }

    return found.sort((a, b) => a[0] - b[0]).map(([, v]) => v);
  };

  return [
    ...side((c, r) => (r === rows - 1 && c < cols - 1 ? c : undefined)),
    ...side((c, r) => (c === cols - 1 && r > 0 ? rows - r : undefined)),
    ...side((c, r) => (r === 0 && c > 0 ? cols - c : undefined)),
    ...side((c, r) => (c === 0 && r < rows - 1 ? r : undefined)),
  ];
}

/** Two triangles per grid cell; vertex `row * cols + col`. */
export function fullGrid(cols: number, rows: number): Triangulation {
  const coords = new Uint32Array(cols * rows * 2);

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const v = row * cols + col;

      coords[2 * v] = col;
      coords[2 * v + 1] = row;
    }
  }

  const triangles = new Uint32Array((cols - 1) * (rows - 1) * 6);

  let t = 0;

  for (let row = 0; row < rows - 1; row++) {
    for (let col = 0; col < cols - 1; col++) {
      const nw = row * cols + col;
      const sw = nw + cols;

      triangles.set([sw, sw + 1, nw + 1, sw, nw + 1, nw], t);

      t += 6;
    }
  }

  return { coords, triangles };
}

/** The model as an indexed mesh, in millimetres: x east, y north, z up. */
export interface Mesh {
  /** Three per vertex: the surface's first, then the bottom ring, then its centre. */
  positions: Float32Array;
  /** Three per triangle, counter-clockwise seen from outside. */
  index: Uint32Array;
  /** The first this many vertices are the surface's. */
  topVertices: number;
  /** The first this many triangles are the surface; walls and bottom follow. */
  topTriangles: number;
  /** Top of the model above the bed. */
  heightMm: number;
}

export const meshTriangles = (mesh: Mesh) => mesh.index.length / 3;

/** Binary STL bytes of a mesh, 50 a triangle. */
export const stlBytes = (mesh: Mesh) => 84 + meshTriangles(mesh) * 50;

/**
 * A closed solid: walls and bottom are built on the surface's own boundary
 * vertices, so every edge has exactly two faces. No data sits at the lowest sample.
 */
export function buildMesh(heights: Float32Array, o: StlOptions): Mesh {
  const { cols, rows } = o;

  let min = Number.POSITIVE_INFINITY;

  let max = Number.NEGATIVE_INFINITY;

  for (const h of heights) {
    if (h < min) {
      min = h;
    }

    if (h > max) {
      max = h;
    }
  }

  if (!Number.isFinite(min)) {
    throw new NoElevationDataError();
  }

  const filled = heights.map((h) => (Number.isNaN(h) ? min : h));

  const zScale = o.mmPerM * o.exaggeration;

  const { coords, triangles: top } =
    o.toleranceMm > 0
      ? simplified(filled, cols, rows, o.toleranceMm / zScale)
      : fullGrid(cols, rows);

  const dx = o.widthMm / (cols - 1);

  const dy = o.depthMm / (rows - 1);

  const topVertices = coords.length / 2;

  const ring = perimeterRing(coords, cols, rows);

  // The surface, then the bottom ring under its boundary, then the bottom's centre.
  const positions = new Float32Array((topVertices + ring.length + 1) * 3);

  // Grid row 0 is the north edge, at the far side of the bed.
  for (let v = 0; v < topVertices; v++) {
    const col = coords[2 * v]!;
    const row = coords[2 * v + 1]!;

    positions[v * 3] = col * dx;
    positions[v * 3 + 1] = (rows - 1 - row) * dy;
    positions[v * 3 + 2] =
      o.baseMm + (filled[row * cols + col]! - min) * zScale;
  }

  ring.forEach((p, i) => {
    positions.set(
      [positions[p * 3]!, positions[p * 3 + 1]!, 0],
      (topVertices + i) * 3,
    );
  });

  const centre = topVertices + ring.length;

  positions.set([o.widthMm / 2, o.depthMm / 2, 0], centre * 3);

  const topTriangles = top.length / 3;

  const index = new Uint32Array((topTriangles + 3 * ring.length) * 3);

  const x = (v: number) => positions[v * 3]!;

  const y = (v: number) => positions[v * 3 + 1]!;

  for (let t = 0; t < top.length; t += 3) {
    const a = top[t]!;
    const b = top[t + 1]!;
    const c = top[t + 2]!;

    // Counter-clockwise seen from above, whatever order Delatin gave.
    const ccw = (x(b) - x(a)) * (y(c) - y(a)) >= (y(b) - y(a)) * (x(c) - x(a));

    index.set(ccw ? [a, b, c] : [a, c, b], t);
  }

  let at = top.length;

  ring.forEach((p, i) => {
    const q = ring[(i + 1) % ring.length]!;

    const pb = topVertices + i;

    const qb = topVertices + ((i + 1) % ring.length);

    // Wall facing out, then the bottom facing down.
    index.set([pb, qb, q, pb, q, p, centre, qb, pb], at);

    at += 9;
  });

  return {
    positions,
    index,
    topVertices,
    topTriangles,
    heightMm: o.baseMm + (max - min) * zScale,
  };
}

/** The mesh as binary STL, written when it is downloaded. */
export function meshToStl(mesh: Mesh): ArrayBuffer {
  const { positions: p, index } = mesh;

  const data = new ArrayBuffer(stlBytes(mesh));

  const view = new DataView(data);

  new Uint8Array(data, 0, 80).set(new TextEncoder().encode('freemap terrain'));

  view.setUint32(80, meshTriangles(mesh), true);

  let at = 84;

  const put = (value: number) => {
    view.setFloat32(at, value, true);

    at += 4;
  };

  const vertex = (v: number) => {
    put(p[v]!);
    put(p[v + 1]!);
    put(p[v + 2]!);
  };

  for (let t = 0; t < index.length; t += 3) {
    const a = index[t]! * 3;
    const b = index[t + 1]! * 3;
    const c = index[t + 2]! * 3;

    const ux = p[b]! - p[a]!;
    const uy = p[b + 1]! - p[a + 1]!;
    const uz = p[b + 2]! - p[a + 2]!;
    const wx = p[c]! - p[a]!;
    const wy = p[c + 1]! - p[a + 1]!;
    const wz = p[c + 2]! - p[a + 2]!;
    const nx = uy * wz - uz * wy;
    const ny = uz * wx - ux * wz;
    const nz = ux * wy - uy * wx;
    const len = Math.hypot(nx, ny, nz) || 1;

    put(nx / len);
    put(ny / len);
    put(nz / len);
    vertex(a);
    vertex(b);
    vertex(c);

    at += 2;
  }

  return data;
}
