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

export interface Stl {
  data: ArrayBuffer;
  triangles: number;
  /** The first this many triangles are the top surface; walls and bottom follow. */
  topTriangles: number;
  /** Top of the model above the bed, millimetres. */
  heightMm: number;
}

/**
 * A closed solid as binary STL: walls and bottom are built on the surface's own
 * boundary vertices, so every edge has exactly two faces. No data sits at the lowest sample.
 */
export function buildStl(heights: Float32Array, o: StlOptions): Stl {
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

  const vertices = coords.length / 2;

  // Model coordinates; grid row 0 is the north edge, at the far side of the bed.
  const vx = new Float32Array(vertices);
  const vy = new Float32Array(vertices);
  const vz = new Float32Array(vertices);

  for (let v = 0; v < vertices; v++) {
    const col = coords[2 * v]!;
    const row = coords[2 * v + 1]!;

    vx[v] = col * dx;
    vy[v] = (rows - 1 - row) * dy;
    vz[v] = o.baseMm + (filled[row * cols + col]! - min) * zScale;
  }

  const ring = perimeterRing(coords, cols, rows);

  const triangles = top.length / 3 + 3 * ring.length;

  const data = new ArrayBuffer(84 + triangles * 50);

  const view = new DataView(data);

  new Uint8Array(data, 0, 80).set(new TextEncoder().encode('freemap terrain'));

  view.setUint32(80, triangles, true);

  let at = 84;

  const put = (...v: number[]) => {
    for (const n of v) {
      view.setFloat32(at, n, true);

      at += 4;
    }
  };

  const tri = (
    ax: number,
    ay: number,
    az: number,
    bx: number,
    by: number,
    bz: number,
    cx: number,
    cy: number,
    cz: number,
  ) => {
    const ux = bx - ax;
    const uy = by - ay;
    const uz = bz - az;
    const wx = cx - ax;
    const wy = cy - ay;
    const wz = cz - az;
    const nx = uy * wz - uz * wy;
    const ny = uz * wx - ux * wz;
    const nz = ux * wy - uy * wx;
    const len = Math.hypot(nx, ny, nz) || 1;

    put(nx / len, ny / len, nz / len, ax, ay, az, bx, by, bz, cx, cy, cz);

    at += 2;
  };

  for (let t = 0; t < top.length; t += 3) {
    const a = top[t]!;
    let b = top[t + 1]!;
    let c = top[t + 2]!;

    // Counter-clockwise seen from above, whatever order Delatin gave.
    if (
      (vx[b]! - vx[a]!) * (vy[c]! - vy[a]!) <
      (vy[b]! - vy[a]!) * (vx[c]! - vx[a]!)
    ) {
      [b, c] = [c, b];
    }

    tri(vx[a]!, vy[a]!, vz[a]!, vx[b]!, vy[b]!, vz[b]!, vx[c]!, vy[c]!, vz[c]!);
  }

  const cx = o.widthMm / 2;

  const cy = o.depthMm / 2;

  for (let i = 0; i < ring.length; i++) {
    const p = ring[i]!;
    const q = ring[(i + 1) % ring.length]!;

    // Wall, facing out.
    tri(vx[p]!, vy[p]!, 0, vx[q]!, vy[q]!, 0, vx[q]!, vy[q]!, vz[q]!);
    tri(vx[p]!, vy[p]!, 0, vx[q]!, vy[q]!, vz[q]!, vx[p]!, vy[p]!, vz[p]!);

    // Bottom, facing down.
    tri(cx, cy, 0, vx[q]!, vy[q]!, 0, vx[p]!, vy[p]!, 0);
  }

  return {
    data,
    triangles,
    topTriangles: top.length / 3,
    heightMm: o.baseMm + (max - min) * zScale,
  };
}
