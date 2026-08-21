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
