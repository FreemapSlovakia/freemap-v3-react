/**
 * The terrain-tiles `/elevation` format, after zstd: `f32` step in metres,
 * `u32` side, then side² `i32` heights in steps, each row delta-coded from 0;
 * `i32::MIN` is no data.
 */
export function decodeSteps(data: Uint8Array): {
  side: number;
  heights: Float32Array;
} {
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);

  const step = view.getFloat32(0, true);

  const side = view.getUint32(4, true);

  const heights = new Float32Array(side * side);

  let off = 8;

  for (let y = 0; y < side; y++) {
    let q = 0;

    for (let x = 0; x < side; x++) {
      q = (q + view.getInt32(off, true)) | 0;

      off += 4;

      heights[y * side + x] = q === -0x80000000 ? Number.NaN : q * step;
    }
  }

  return { side, heights };
}
