import { decodeDepthValues, gunzip } from './depth.js';

/**
 * Inflates and delta-decodes one render's distance buffer. Both halves used to
 * run on the main thread between the response landing and the picture
 * appearing, which on a detailed render is a gunzip to ~20 MB, an allocation
 * the same size again and several million loop iterations — long enough that
 * the page stopped answering the mouse.
 *
 * The gzipped part arrives as a `Blob`, which structured-clones by reference
 * rather than by copy, and the decoded rows go back as a transfer.
 */
self.onmessage = (evt) => {
  const id = evt.data.id;

  const { blob, width, height } = evt.data.payload as {
    blob: Blob;
    width: number;
    height: number;
  };

  gunzip(blob)
    .then((buffer) => {
      const values = decodeDepthValues(buffer, width, height);

      self.postMessage({ id, payload: values }, [values.buffer]);
    })
    .catch((err: unknown) => {
      self.postMessage({
        id,
        error: (err instanceof Error ? err.message : '') || 'depth decode',
      });
    });
};
