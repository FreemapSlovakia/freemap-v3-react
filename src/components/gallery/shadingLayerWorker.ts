import { decompress, init } from '@bokuweb/zstd-wasm';

const initPromise = init();

self.onmessage = async (evt) => {
  const id = evt.data.id;

  try {
    await initPromise;

    const raw = decompress(evt.data.payload);

    self.postMessage({ id, payload: raw }, [raw.buffer]);
  } catch (err) {
    console.error('error in shading tile worker');

    console.error(err);

    self.postMessage(
      { id, error: (err instanceof Error ? err.message : '') || 'gtwe' },
      [],
    );
  }
};
