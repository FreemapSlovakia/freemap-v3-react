import { renderGalleryTile } from './galleryTileRenderrer.js';

self.onmessage = (evt) => {
  const id = evt.data.id;

  try {
    renderGalleryTile(evt.data);

    self.postMessage({ id }, []);
  } catch (err) {
    console.error('error in gallery tile worker');

    console.error(err);

    self.postMessage(
      { id, error: (err instanceof Error ? err.message : '') || 'gtwe' },
      [],
    );
  }
};
