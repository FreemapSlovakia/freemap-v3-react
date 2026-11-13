import type { Bbox } from '@features/mapArea/model/actions.js';

const TILE = 256;

/** A decoded terrain-tiles `/elevation` tile: heights in metres, `NaN` for no data. */
export interface ElevationTile {
  data: Float32Array;
  /** 256 + 2 × buffer. */
  side: number;
  buffer: number;
}

/**
 * The grid in world pixels at `zoom`: columns evenly in longitude, rows evenly
 * in latitude — equal ground steps both ways, which Mercator rows would not be.
 * `rowY` is a row's vertex, `rowSpan` its cell's north and south edges.
 */
function gridPixels(bbox: Bbox, cols: number, rows: number, zoom: number) {
  const [west, south, east, north] = bbox;

  const world = TILE * 2 ** zoom;

  const px = (lon: number) => ((lon + 180) / 360) * world;

  const py = (lat: number) => {
    const s = Math.sin((lat * Math.PI) / 180);

    return (0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)) * world;
  };

  const x0 = px(west);

  const dLat = (north - south) / (rows - 1);

  const lat = (row: number) => north - row * dLat;

  return {
    x0,
    dx: (px(east) - x0) / (cols - 1),
    // Mean row spacing, for choosing between averaging and interpolating.
    dy: (py(south) - py(north)) / (rows - 1),
    rowY: (row: number) => py(lat(row)),
    rowSpan: (row: number): [number, number] => [
      py(lat(row) + dLat / 2),
      py(lat(row) - dLat / 2),
    ],
  };
}

/** The tile ranges the grid reads, inclusive. */
function tileRange(bbox: Bbox, cols: number, rows: number, zoom: number) {
  const { x0, dx, dy, rowY, rowSpan } = gridPixels(bbox, cols, rows, zoom);

  // An averaged cell reaches half a step past its vertex; a bilinear sample
  // reads the pixel left of / above its centre, the buffer supplying the next.
  const avg = averages(dx, dy);

  const tile = (p: number) => Math.floor(Math.floor(p) / TILE);

  const xEnd = x0 + dx * (cols - 1);

  return {
    x: avg
      ? [tile(x0 - dx / 2), tile(xEnd + dx / 2)]
      : [tile(x0 - 0.5), tile(xEnd - 0.5)],
    y: avg
      ? [tile(rowSpan(0)[0]), tile(rowSpan(rows - 1)[1])]
      : [tile(rowY(0) - 0.5), tile(rowY(rows - 1) - 0.5)],
  };
}

/** How many tiles the grid reads, without listing them. */
export function tileCount(
  bbox: Bbox,
  cols: number,
  rows: number,
  zoom: number,
): number {
  const { x, y } = tileRange(bbox, cols, rows, zoom);

  return (x[1]! - x[0]! + 1) * (y[1]! - y[0]! + 1);
}

/** Tiles the grid reads, as `[x, y]`. */
export function neededTiles(
  bbox: Bbox,
  cols: number,
  rows: number,
  zoom: number,
): [number, number][] {
  const { x, y } = tileRange(bbox, cols, rows, zoom);

  const tiles: [number, number][] = [];

  for (let ty = y[0]!; ty <= y[1]!; ty++) {
    for (let tx = x[0]!; tx <= x[1]!; tx++) {
      tiles.push([tx, ty]);
    }
  }

  return tiles;
}

/** A cell spanning two pixels or more is averaged; a smaller one interpolated. */
function averages(dx: number, dy: number): boolean {
  return dx >= 2 && dy >= 2;
}

/**
 * Heights at the grid's vertices, row-major from the north: where a cell spans
 * two pixels or more, their mean weighted by overlap, else bilinear (nearest
 * beside no data). `NaN` where no pixel has any.
 */
export function sampleGrid(
  bbox: Bbox,
  cols: number,
  rows: number,
  zoom: number,
  tileAt: (x: number, y: number) => ElevationTile | undefined,
): Float32Array {
  const grid = gridPixels(bbox, cols, rows, zoom);

  // Consecutive samples nearly always want the tile the last one did, and the
  // caller's lookup may cost a string key per call — millions of them.
  let last: { x: number; y: number; tile?: ElevationTile } | undefined;

  const cachedTileAt = (x: number, y: number) => {
    if (last?.x !== x || last.y !== y) {
      last = { x, y, tile: tileAt(x, y) };
    }

    return last.tile;
  };

  return averages(grid.dx, grid.dy)
    ? averaged(grid, cols, rows, cachedTileAt)
    : interpolated(grid, cols, rows, cachedTileAt);
}

type Grid = ReturnType<typeof gridPixels>;

function averaged(
  { x0, dx, rowSpan }: Grid,
  cols: number,
  rows: number,
  tileAt: (x: number, y: number) => ElevationTile | undefined,
): Float32Array {
  const out = new Float32Array(cols * rows);

  const pixel = (ix: number, iy: number) => {
    const tx = Math.floor(ix / TILE);

    const ty = Math.floor(iy / TILE);

    const tile = tileAt(tx, ty);

    return tile
      ? tile.data[
          (iy - ty * TILE + tile.buffer) * tile.side +
            (ix - tx * TILE + tile.buffer)
        ]!
      : Number.NaN;
  };

  // Pixel `i` spans [i, i + 1], weighted by its overlap with the cell; whole
  // pixels would stripe the surface where the step isn't a whole number of them.
  const overlap = (i: number, a: number, b: number) =>
    Math.min(i + 1, b) - Math.max(i, a);

  for (let row = 0; row < rows; row++) {
    const [ya, yb] = rowSpan(row);

    for (let col = 0; col < cols; col++) {
      const xa = x0 + col * dx - dx / 2;

      const xb = xa + dx;

      let sum = 0;

      let weight = 0;

      for (let iy = Math.floor(ya); iy < yb; iy++) {
        const wy = overlap(iy, ya, yb);

        for (let ix = Math.floor(xa); ix < xb; ix++) {
          const h = pixel(ix, iy);

          if (!Number.isNaN(h)) {
            const w = wy * overlap(ix, xa, xb);

            sum += h * w;

            weight += w;
          }
        }
      }

      out[row * cols + col] = weight > 0 ? sum / weight : Number.NaN;
    }
  }

  return out;
}

function interpolated(
  { x0, dx, rowY }: Grid,
  cols: number,
  rows: number,
  tileAt: (x: number, y: number) => ElevationTile | undefined,
): Float32Array {
  const out = new Float32Array(cols * rows);

  for (let row = 0; row < rows; row++) {
    const fy = rowY(row) - 0.5;

    const iy = Math.floor(fy);

    const ty = fy - iy;

    const tileY = Math.floor(iy / TILE);

    for (let col = 0; col < cols; col++) {
      const fx = x0 + col * dx - 0.5;

      const ix = Math.floor(fx);

      const tx = fx - ix;

      const tileX = Math.floor(ix / TILE);

      const tile = tileAt(tileX, tileY);

      if (!tile) {
        out[row * cols + col] = Number.NaN;

        continue;
      }

      const { data, side, buffer } = tile;

      const i =
        (iy - tileY * TILE + buffer) * side + (ix - tileX * TILE + buffer);

      const a = data[i]!;
      const b = data[i + 1]!;
      const c = data[i + side]!;
      const d = data[i + side + 1]!;

      let h =
        a * (1 - tx) * (1 - ty) +
        b * tx * (1 - ty) +
        c * (1 - tx) * ty +
        d * tx * ty;

      if (Number.isNaN(h)) {
        h = [
          [a, (1 - tx) * (1 - ty)],
          [b, tx * (1 - ty)],
          [c, (1 - tx) * ty],
          [d, tx * ty],
        ].reduce(
          (best, [v, w]) =>
            !Number.isNaN(v!) && w! > best[1] ? [v!, w!] : best,
          [Number.NaN, -1],
        )[0];
      }

      out[row * cols + col] = h;
    }
  }

  return out;
}
