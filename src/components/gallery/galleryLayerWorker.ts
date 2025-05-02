import { renderGalleryTile } from './galleryTileRenderrer.js';

self.onmessage = (evt) => {
  const id = evt.data.id;

  try {
    const tile = new OffscreenCanvas(256, 256);

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
