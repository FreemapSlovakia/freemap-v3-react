import { renderGalleryTile } from './galleryTileRenderrer.js';

self.onmessage = (evt) => {
  const id = evt.data.id;

  try {
    const { size, dpr } = evt.data.payload;

    // Match the on-screen tile's device-pixel dimensions (renderGalleryTile
    // scales by dpr), so the bitmap fills the whole tile — a fixed 256×256 only
    // covers the top-left quarter on a dpr=2 display.
    const tile = new OffscreenCanvas(size.x * dpr, size.y * dpr);

    renderGalleryTile({
      ...evt.data.payload,
      tile,
    });

    const imageBitmap = tile.transferToImageBitmap();

    self.postMessage({ id, payload: imageBitmap }, [imageBitmap]);
  } catch (err) {
    console.error('error in gallery tile worker');

    console.error(err);

    self.postMessage(
      { id, error: (err instanceof Error ? err.message : '') || 'gtwe' },
      [],
    );
  }
};
