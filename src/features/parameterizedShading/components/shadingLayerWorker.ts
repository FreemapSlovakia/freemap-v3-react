import { decompress, init } from '@bokuweb/zstd-wasm';
import * as Lerc from 'lerc';
import lercWasm from 'lerc/lerc-wasm.wasm';

const initPromise = Promise.all([
  init(),
  Lerc.load({
    locateFile: () => lercWasm,
  }),
]);

const LERC_MAGIC = 'Lerc2 ';

function isLerc(data: Uint8Array) {
  for (let i = 0; i < LERC_MAGIC.length; i++) {
    if (data[i] !== LERC_MAGIC.charCodeAt(i)) {
      return false;
    }
  }

  return true;
}

/**
 * The terrain-tiles format: `f32` step in metres, `u32` side, then side² `i32`
 * heights in steps, each row delta-coded from 0; `i32::MIN` is no data.
 */
function decodeSteps(data: Uint8Array) {
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);

  const step = view.getFloat32(0, true);

  const side = view.getUint32(4, true);

  const out = new Float32Array(side * side);

  let off = 8;

  for (let y = 0; y < side; y++) {
    let q = 0;

    for (let x = 0; x < side; x++) {
      q = (q + view.getInt32(off, true)) | 0;

      off += 4;

      out[y * side + x] = q === -0x80000000 ? NaN : q * step;
    }
  }

  return out;
}

self.onmessage = async (evt) => {
  const id = evt.data.id;

  try {
    await initPromise;

    const data = decompress(evt.data.payload);

    if (!isLerc(data)) {
      const payload = decodeSteps(data);

      self.postMessage({ id, payload }, [payload.buffer]);

      return;
    }

    const pixelBlock = Lerc.decode(data);

    if (pixelBlock.mask) {
      let off = 0;

      for (const chunk of pixelBlock.pixels) {
        for (let i = 0; i < chunk.length; i++) {
          if (pixelBlock.mask[off + i] === 0) {
            chunk[i] = NaN;
          }
        }

        off += chunk.length;
      }
    }

    const arrays: Float32Array[] = pixelBlock.pixels as Float32Array[];

    const totalLength = arrays.reduce((sum, arr) => sum + arr.length, 0);

    const flat = new Float32Array(totalLength);

    let offset = 0;

    for (const arr of arrays) {
      flat.set(arr, offset);

      offset += arr.length;
    }

    const payload = flat;

    self.postMessage({ id, payload }, [payload.buffer]);
  } catch (err) {
    console.error('error in shading tile worker');

    console.error(err);

    self.postMessage(
      { id, error: (err instanceof Error ? err.message : '') || 'gtwe' },
      [],
    );
  }
};
