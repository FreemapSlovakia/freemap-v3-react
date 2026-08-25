/**
 * The distance buffer: one distance per rendered pixel, which is what lets the
 * viewer answer "how far is that ridge?" and turn a press on the picture into a
 * place on the map.
 *
 * Wire encoding, in order: distance → logarithmic 16-bit → quantised → delta
 * coded along each row → gzip.
 */
export interface PanoramaDepth {
  width: number;
  height: number;
  values: Uint16Array;
  nearM: number;
  farM: number;
  /** The value that means "nothing there", as the render reported it. */
  sky: number;
}

export type PanoramaDepthMeta = {
  near_m: number;
  far_m: number;
  sky: number;
};

export async function decodeDepth(
  blob: Blob,
  width: number,
  height: number,
  meta: PanoramaDepthMeta,
): Promise<PanoramaDepth> {
  const buffer = await new Response(
    blob.stream().pipeThrough(new DecompressionStream('gzip')),
  ).arrayBuffer();

  // Checked rather than trusted: a short buffer would otherwise decode its
  // whole missing tail as sky, and the readouts would simply stop answering
  // over most of the picture with nothing said. `Int16Array` also throws on an
  // odd byte length, which is the same corruption arriving a different way.
  if (buffer.byteLength !== width * height * 2) {
    throw new Error(
      `panorama depth is ${buffer.byteLength} bytes, expected ${width * height * 2}`,
    );
  }

  const deltas = new Int16Array(buffer);

  const values = new Uint16Array(width * height);

  for (let row = 0; row < height; row++) {
    let acc = 0;

    for (let col = 0; col < width; col++) {
      const i = row * width + col;

      // Values span the whole unsigned range while the deltas are signed, so a
      // step between sky and distant terrain overflows on purpose. Without the
      // mask the distances come out silently wrong rather than failing.
      acc = (acc + (deltas[i] ?? 0)) & 0xffff;

      values[i] = acc;
    }
  }

  return {
    width,
    height,
    values,
    nearM: meta.near_m,
    farM: meta.far_m,
    sky: meta.sky,
  };
}

/** A place down a column: where it is in the picture, and how far off it is. */
export type PanoramaSample = {
  /** Fractional image row. */
  iy: number;
  /** Metres — the place asked for, or the visible one it was moved to. */
  distance: number;
  /**
   * Whether the place asked for is the place answered. False where it cannot be
   * seen down this column and was moved to what can — a mark being dragged
   * shows nothing at all there rather than a mark on ground nobody asked about.
   */
  visible: boolean;
};

/**
 * A step down a column bigger than this fraction of the row below it is read as
 * a silhouette rather than as a slope. A heuristic, and heuristics are all a
 * column of distances allows: telling a hidden place from a visible one
 * properly needs its own elevation. Generous, so ordinary terrain is left
 * alone — the cost being that a silhouette far off, where the rows are already
 * kilometres apart, can step less than this and pass for a slope. Rendering the
 * picture finer is what answers that; see `doc/panorama.md`.
 */
const OCCLUSION_STEP = 0.25;

/**
 * What a place at `distance` down the column at `x` shows up as —
 * {@link distanceAt} backwards, for a place named on the map rather than picked
 * out of the picture.
 *
 * Distance falls down a column: a ray raised clears whatever is in front of it,
 * so every visible sample is farther than the one below. That makes the row a
 * binary search, and the encoded values are already logarithmic in distance, so
 * the interpolation between two rows can be done on them directly.
 *
 * **A place that can't be seen is moved to one that can** — the two rows the
 * jump lies between are the ridge hiding it and the first terrain visible
 * beyond it, and the answer is whichever of them stands nearer to it. Marking
 * where it *would* be would claim a view of ground behind a ridge. A place
 * beyond everything the column can see comes back as the last silhouette, and
 * one nearer than the frame reaches as its bottom row. `null` only where the
 * column is nothing but sky.
 */
export function visibleAtDistance(
  depth: PanoramaDepth,
  x: number,
  distance: number,
): PanoramaSample | null {
  const col = Math.floor(x);

  if (col < 0 || col >= depth.width) {
    return null;
  }

  const at = (row: number) => depth.values[row * depth.width + col] ?? 0;

  // The sentinel is not on the distance scale, so the sky above the skyline
  // has to be stepped over before anything can be compared. Linear, not
  // halved: a column is terrain below and sky above, but nothing guarantees
  // where the edge is if a render ever leaves a gap.
  let top = 0;

  while (top < depth.height && at(top) === depth.sky) {
    top++;
  }

  if (top >= depth.height) {
    return null;
  }

  const logNear = Math.log(depth.nearM);

  const logSpan = Math.log(depth.farM) - logNear;

  const encode = (m: number) =>
    1 + ((Math.log(Math.max(m, depth.nearM)) - logNear) / logSpan) * 65534;

  const decode = (v: number) => Math.exp(logNear + ((v - 1) / 65534) * logSpan);

  const target = encode(distance);

  const silhouette = at(top);

  if (silhouette < target) {
    return { iy: top + 0.5, distance: decode(silhouette), visible: false };
  }

  // The topmost row that is no farther than the target; the one above it is
  // farther, and the crossing lies between the two.
  let lo = top;

  let hi = depth.height - 1;

  while (lo < hi) {
    const mid = (lo + hi) >> 1;

    if (at(mid) <= target) {
      hi = mid;
    } else {
      lo = mid + 1;
    }
  }

  const near = at(lo);

  if (near > target) {
    // Nearer than anything the column holds: it is below the frame, and the
    // frame's own bottom row is the nearest thing to it that is in the picture.
    return { iy: depth.height - 0.5, distance: decode(near), visible: false };
  }

  // The skyline row has nothing above it to have crossed from, which the tail
  // below reads as no gap at all — and so as the row's own centre.
  const far = lo === top ? near : at(lo - 1);

  const nearM = decode(near);

  const farM = decode(far);

  if (farM - nearM > nearM * OCCLUSION_STEP) {
    // Hidden: the nearer of the two places that can actually be seen along
    // this line, which are the ridge and whatever stands beyond it.
    return distance - nearM <= farM - distance
      ? { iy: lo + 0.5, distance: nearM, visible: false }
      : { iy: lo - 0.5, distance: farM, visible: false };
  }

  // Row centres, which is where a row's own value belongs.
  return {
    iy: far === near ? lo + 0.5 : lo + 0.5 - (target - near) / (far - near),
    distance,
    visible: true,
  };
}

/** Distance in metres at an image pixel, or null for sky and off-image. */
export function distanceAt(
  depth: PanoramaDepth,
  x: number,
  y: number,
): number | null {
  const col = Math.floor(x);

  const row = Math.floor(y);

  if (col < 0 || row < 0 || col >= depth.width || row >= depth.height) {
    return null;
  }

  const v = depth.values[row * depth.width + col];

  // Compared against the sentinel the render named rather than against zero:
  // were it ever to move, a press on the sky would otherwise mark a place on
  // the map at whatever distance zero happens to decode to.
  if (v === undefined || v === depth.sky) {
    return null;
  }

  const logNear = Math.log(depth.nearM);

  return Math.exp(
    logNear + ((v - 1) / 65534) * (Math.log(depth.farM) - logNear),
  );
}
