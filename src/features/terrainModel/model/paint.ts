import type { Bbox } from '@features/mapArea/model/actions.js';

/** `[lon, lat]` vertices of one line or ring. */
export type LineCoords = number[][];

/** What a model is coloured with, each shape by its palette index; 0 is the ground. */
export interface Paint {
  /** `#rrggbb` per palette index, the ground's first. */
  palette: string[];
  /** Filled first, even-odd over their rings. */
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
  const [west, south, east, north] = bbox;

  const classes = new Uint8Array(cols * rows);

  const dx = widthMm / (cols - 1);

  const dy = depthMm / (rows - 1);

  // Thinner, and a line passes between grid points and prints broken.
  const minR = Math.hypot(dx, dy) / 2;

  const x = (lon: number) => ((lon - west) / (east - west)) * widthMm;

  const y = (lat: number) => ((north - lat) / (north - south)) * depthMm;

  // TODO: a ring of very many vertices (a country's boundary) costs edges × rows;
  // bucket the edges by row if that ever matters.
  for (const { colour, rings } of paint.fills) {
    const edges = rings.flatMap((ring) =>
      ring.slice(1).map((q, i) => {
        const p = ring[i]!;

        return [x(p[0]!), y(p[1]!), x(q[0]!), y(q[1]!)] as const;
      }),
    );

    for (let row = 0; row < rows; row++) {
      const py = row * dy;

      const crossings: number[] = [];

      for (const [ax, ay, bx, by] of edges) {
        // Half-open, so a vertex on the row is counted once.
        if (ay <= py !== by <= py) {
          crossings.push(ax + ((py - ay) / (by - ay)) * (bx - ax));
        }
      }

      crossings.sort((a, b) => a - b);

      for (let i = 0; i + 1 < crossings.length; i += 2) {
        const c0 = Math.max(0, Math.ceil(crossings[i]! / dx));
        const c1 = Math.min(cols - 1, Math.floor(crossings[i + 1]! / dx));

        classes.fill(colour, row * cols + c0, row * cols + c1 + 1);
      }
    }
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
