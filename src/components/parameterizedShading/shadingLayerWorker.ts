import { decompress, init } from '@bokuweb/zstd-wasm';
import * as Lerc from 'lerc';
import lercWasm from 'lerc/lerc-wasm.wasm';

const initPromise = Promise.all([
  init(),
  Lerc.load({
    locateFile: () => lercWasm,
  }),
]);

self.onmessage = async (evt) => {
  const id = evt.data.id;

  try {
    await initPromise;

    const pixelBlock = Lerc.decode(decompress(evt.data.payload));

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

    // const flat = decompress(evt.data.payload);

    // const payload = new Float32Array(
    //   flat.buffer,
    //   flat.byteOffset,
    //   flat.byteLength / 4,
    // );

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
