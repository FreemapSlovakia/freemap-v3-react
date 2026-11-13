import { decompress, init } from '@bokuweb/zstd-wasm';
import { decodeSteps } from '@shared/elevationTile.js';
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

self.onmessage = async (evt) => {
  const id = evt.data.id;

  try {
    await initPromise;

    const data = decompress(evt.data.payload);

    if (!isLerc(data)) {
      const payload = decodeSteps(data).heights;

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
