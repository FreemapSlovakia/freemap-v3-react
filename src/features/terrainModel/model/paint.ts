import type { Bbox } from '@features/mapArea/model/actions.js';

/** `[lon, lat]` vertices of one line or ring. */
export type LineCoords = number[][];

/** What a model is coloured with, each shape by its palette index; 0 is the ground. */
export interface Paint {
  /** `#rrggbb` per palette index, the ground's first. */
  palette: string[];
  /** Landcover, under everything else; even-odd, as the fills. */
  landcover: { colour: number; rings: LineCoords[] }[];
  /** Landcover narrower than about this, mm, is smoothed into its surroundings. */
  landcoverDetailMm: number;
  /** Filled over the landcover, even-odd over their rings. */
  fills: { colour: number; rings: LineCoords[] }[];
  /** Then the lines, a later one over an earlier one. */
  lines: { colour: number; coords: LineCoords }[];
  /** Then the points, as discs. */
  points: { colour: number; coords: number[] }[];
  /** Line width on the model, millimetres. */
  lineWidthMm: number;
  /** Point diameter on the model, millimetres. */
  pointSizeMm: number;
}

/** Projects onto a grid of `cols` × `rows` points spanning the model. */
function gridOf(
  [west, south, east, north]: Bbox,
  cols: number,
  rows: number,
  widthMm: number,
  depthMm: number,
) {
  const dx = widthMm / (cols - 1);

  const dy = depthMm / (rows - 1);

  const x = (lon: number) => ((lon - west) / (east - west)) * widthMm;

  const y = (lat: number) => ((north - lat) / (north - south)) * depthMm;

  // Each edge goes to the rows it crosses, so a ring of many vertices costs
  // its edges plus its crossings, not edges × rows.
  const fill = (target: Uint8Array, colour: number, rings: LineCoords[]) => {
    const crossings = new Map<number, number[]>();

    for (const ring of rings) {
      let bx = x(ring[0]?.[0] ?? 0);
      let by = y(ring[0]?.[1] ?? 0);

      for (let i = 1; i < ring.length; i++) {
        const ax = bx;
        const ay = by;

        bx = x(ring[i]![0]!);
        by = y(ring[i]![1]!);

        // Half-open, so a vertex on a row is counted once.
        const r0 = Math.max(0, Math.ceil(Math.min(ay, by) / dy));
        const r1 = Math.min(rows - 1, Math.ceil(Math.max(ay, by) / dy) - 1);

        for (let row = r0; row <= r1; row++) {
          const py = row * dy;

          let list = crossings.get(row);

          if (!list) {
            list = [];

            crossings.set(row, list);
          }

          list.push(ax + ((py - ay) / (by - ay)) * (bx - ax));
        }
      }
    }

    for (const [row, list] of crossings) {
      list.sort((a, b) => a - b);

      for (let i = 0; i + 1 < list.length; i += 2) {
        const c0 = Math.max(0, Math.ceil(list[i]! / dx));
        const c1 = Math.min(cols - 1, Math.floor(list[i + 1]! / dx));

        if (c0 <= c1) {
          target.fill(colour, row * cols + c0, row * cols + c1 + 1);
        }
      }
    }
  };

  return { dx, dy, x, y, fill };
}

/**
 * The landcover alone on the grid, 0 where there is none, opened so that
 * nothing narrower than the detail is left (bare ground included).
 */
export function landcoverGrid(
  bbox: Bbox,
  cols: number,
  rows: number,
  widthMm: number,
  depthMm: number,
  paint: Paint,
): Uint8Array {
  const { dx, dy, fill } = gridOf(bbox, cols, rows, widthMm, depthMm);

  const grid = new Uint8Array(cols * rows);

  for (const { colour, rings } of paint.landcover) {
    fill(grid, colour, rings);
  }

  return openClasses(
    grid,
    cols,
    rows,
    paint.landcoverDetailMm / 2 / Math.sqrt(dx * dy),
  );
}

const FAR = 1e20;

/**
 * Squared Euclidean distance from each point to the nearest site and, with
 * `withNear`, which site that is (Felzenszwalb & Huttenlocher).
 */
export function distanceTransform(
  sites: Uint8Array,
  cols: number,
  rows: number,
  withNear = true,
): { d2: Float32Array; near: Int32Array } {
  const n = cols * rows;

  const d2 = new Float32Array(n);

  const near = new Int32Array(withNear ? n : 0);

  const len = Math.max(cols, rows);

  const f = new Float64Array(len);
  const d = new Float64Array(len);
  const arg = new Int32Array(len);
  const v = new Int32Array(len);
  const z = new Float64Array(len + 1);

  const meet = (q: number, p: number) =>
    (f[q]! + q * q - (f[p]! + p * p)) / (2 * (q - p));

  // The lower envelope of q ↦ (q − p)² + f[p] over p < `length`.
  const pass = (length: number) => {
    let k = 0;

    v[0] = 0;
    z[0] = -Infinity;
    z[1] = Infinity;

    for (let q = 1; q < length; q++) {
      let s = meet(q, v[k]!);

      // `z[0]` is −∞, so this stops at the first parabola.
      while (s <= z[k]!) {
        k--;

        s = meet(q, v[k]!);
      }

      k++;
      v[k] = q;
      z[k] = s;
      z[k + 1] = Infinity;
    }

    k = 0;

    for (let q = 0; q < length; q++) {
      while (z[k + 1]! < q) {
        k++;
      }

      const p = v[k]!;

      d[q] = (q - p) ** 2 + f[p]!;

      arg[q] = p;
    }
  };

  // Per column: the nearest site's row.
  const nearRow = new Int32Array(withNear ? n : 0);

  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      f[r] = sites[r * cols + c] ? 0 : FAR;
    }

    pass(rows);

    for (let r = 0; r < rows; r++) {
      d2[r * cols + c] = d[r]!;

      if (withNear) {
        nearRow[r * cols + c] = arg[r]!;
      }
    }
  }

  for (let r = 0; r < rows; r++) {
    const base = r * cols;

    for (let c = 0; c < cols; c++) {
      f[c] = d2[base + c]!;
    }

    pass(cols);

    for (let c = 0; c < cols; c++) {
      const col = arg[c]!;

      d2[base + c] = d[c]!;

      if (withNear) {
        near[base + c] = nearRow[base + col]! * cols + col;
      }
    }
  }

  return { d2, near };
}

/**
 * A morphological opening of each value by a disc of `radius` points: what is
 * narrower than the disc's diameter goes. A point its own value lost takes the
 * value of the nearest core, so a filled gap need not be that wide.
 */
export function openClasses(
  grid: Uint8Array,
  cols: number,
  rows: number,
  radius: number,
): Uint8Array {
  // Every point is at least 1 from another value, so a smaller disc erodes
  // nothing; above it, the result steps where r² passes a sum of two squares.
  if (radius < 1) {
    return grid;
  }

  const n = cols * rows;

  const r2 = radius * radius;

  // Each value eroded: its points farther than the radius from any other.
  const core = new Uint8Array(n);

  const others = new Uint8Array(n);

  for (const value of new Set(grid)) {
    for (let i = 0; i < n; i++) {
      others[i] = grid[i] === value ? 0 : 1;
    }

    const { d2 } = distanceTransform(others, cols, rows, false);

    for (let i = 0; i < n; i++) {
      const c = i % cols;

      const r = (i - c) / cols;

      // Past the edge counts as another value, so a strip along it goes too.
      const edge = Math.min(c, r, cols - 1 - c, rows - 1 - r) + 1;

      if (grid[i] === value && d2[i]! > r2 && edge * edge > r2) {
        core[i] = 1;
      }
    }
  }

  // Nothing wide enough anywhere: better as drawn than as one value.
  if (!core.includes(1)) {
    return grid;
  }

  // Dilated back, all at once: a core lies over the radius from every other
  // value, so a point's nearest core within it is its own; past it, the
  // nearest core's value is the nearest kept one's.
  const { near } = distanceTransform(core, cols, rows);

  const out = new Uint8Array(n);

  for (let i = 0; i < n; i++) {
    out[i] = grid[near[i]!]!;
  }

  return out;
}

/**
 * The palette index of each grid point, row-major from the north. Columns are
 * even in longitude and rows in latitude, as the grid is sampled; distances
 * are measured on the model.
 */
export function paintGrid(
  bbox: Bbox,
  cols: number,
  rows: number,
  widthMm: number,
  depthMm: number,
  paint: Paint,
): Uint8Array {
  const { dx, dy, x, y, fill } = gridOf(bbox, cols, rows, widthMm, depthMm);

  const classes = paint.landcover.length
    ? landcoverGrid(bbox, cols, rows, widthMm, depthMm, paint)
    : new Uint8Array(cols * rows);

  // Thinner, and a line passes between grid points and prints broken.
  const minR = Math.hypot(dx, dy) / 2;

  for (const { colour, rings } of paint.fills) {
    fill(classes, colour, rings);
  }

  /** Every grid point within `r` of the segment a–b. */
  const segment = (
    colour: number,
    ax: number,
    ay: number,
    bx: number,
    by: number,
    radius: number,
  ) => {
    const r = Math.max(radius, minR);
    const ux = bx - ax;
    const uy = by - ay;
    const len2 = ux * ux + uy * uy;
    const r2 = r * r;

    const c0 = Math.max(0, Math.ceil((Math.min(ax, bx) - r) / dx));
    const c1 = Math.min(cols - 1, Math.floor((Math.max(ax, bx) + r) / dx));
    const r0 = Math.max(0, Math.ceil((Math.min(ay, by) - r) / dy));
    const r1 = Math.min(rows - 1, Math.floor((Math.max(ay, by) + r) / dy));

    for (let row = r0; row <= r1; row++) {
      const py = row * dy;

      for (let col = c0; col <= c1; col++) {
        const px = col * dx;

        const s =
          len2 > 0
            ? Math.max(0, Math.min(1, ((px - ax) * ux + (py - ay) * uy) / len2))
            : 0;

        const ex = ax + s * ux - px;
        const ey = ay + s * uy - py;

        if (ex * ex + ey * ey <= r2) {
          classes[row * cols + col] = colour;
        }
      }
    }
  };

  for (const { colour, coords } of paint.lines) {
    for (let i = 0; i < coords.length; i++) {
      const p = coords[i]!;
      // A line of one vertex is a dot.
      const q = coords[i + 1] ?? (coords.length === 1 ? p : undefined);

      if (!q) {
        break;
      }

      segment(
        colour,
        x(p[0]!),
        y(p[1]!),
        x(q[0]!),
        y(q[1]!),
        paint.lineWidthMm / 2,
      );
    }
  }

  for (const { colour, coords } of paint.points) {
    const px = x(coords[0]!);
    const py = y(coords[1]!);

    segment(colour, px, py, px, py, paint.pointSizeMm / 2);
  }

  return classes;
}
