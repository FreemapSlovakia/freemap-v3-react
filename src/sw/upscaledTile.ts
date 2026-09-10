/// <reference lib="webworker" />

/**
 * Drawing a tile nobody holds from one that is held a few zooms above it —
 * Leaflet stretches a whole grid past `maxNativeZoom`, but a single tile missing
 * from a cache is an error tile to it, so this is the only place a cached map can
 * fill one in.
 */

// How far up the pyramid an ancestor is looked for: six levels is a 64× blow-up,
// four source pixels across a 256px tile. Deliberately not unbounded — the blank
// past the last blurred tile is what says the downloaded area has ended.
const MAX_LEVELS = 6;

export type TileCoords = { x: number; y: number; z: number };

/** Rows counted from the other end, which is all TMS numbering differs by. */
export function flipY(y: number, z: number): number {
  return 2 ** z - 1 - y;
}

/**
 * The tile at `coords` drawn from the nearest ancestor `lookup` finds, cropped
 * to the part it covers and blown up to tile size; `null` when no ancestor is
 * held or the platform can't draw one. The climb stops at `minZoom`, below which
 * the caller holds nothing. Coordinates are XYZ — a TMS layer flips its rows on
 * either side of this.
 */
export async function upscaledTile(
  coords: TileCoords,
  lookup: (ancestor: TileCoords) => Promise<Response | undefined>,
  minZoom = 0,
): Promise<Response | null> {
  const { x, y, z } = coords;

  for (
    let levels = 1;
    levels <= MAX_LEVELS && z - levels >= minZoom;
    levels++
  ) {
    const span = 2 ** levels;

    const ancestorX = Math.floor(x / span);

    const ancestorY = Math.floor(y / span);

    const ancestor = await lookup({
      x: ancestorX,
      y: ancestorY,
      z: z - levels,
    });

    const drawn =
      ancestor &&
      (await crop(ancestor, x - ancestorX * span, y - ancestorY * span, span));

    if (drawn) {
      return drawn;
    }
  }

  return null;
}

/** The `col`,`row` cell of a `span`×`span` division of the tile, at full size. */
async function crop(
  tile: Response,
  col: number,
  row: number,
  span: number,
): Promise<Response | null> {
  // checked before the decode, so a browser without it doesn't decode a tile per
  // level only to throw on each
  if (typeof OffscreenCanvas === 'undefined') {
    return null;
  }

  let bitmap: ImageBitmap | undefined;

  try {
    const type = tile.headers.get('content-type');

    bitmap = await createImageBitmap(await tile.blob());

    const { width, height } = bitmap;

    const canvas = new OffscreenCanvas(width, height);

    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return null;
    }

    ctx.drawImage(
      bitmap,
      (col * width) / span,
      (row * height) / span,
      width / span,
      height / span,
      0,
      0,
      width,
      height,
    );

    const blob = await canvas.convertToBlob(
      type === 'image/jpeg' ? { type, quality: 0.8 } : { type: 'image/png' },
    );

    return new Response(blob, { headers: { 'Content-Type': blob.type } });
  } catch {
    // a body that isn't an image, or a canvas the platform won't give; the
    // caller answers 404
    return null;
  } finally {
    bitmap?.close();
  }
}
