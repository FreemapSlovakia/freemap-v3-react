import { renderGalleryTile } from './galleryTileRenderrer';

self.onmessage = (evt) => {
  const id = evt.data.id;

  try {
    renderGalleryTile(evt.data);

    self.postMessage({ id }, [] as any);
  } catch (err) {
    console.error('error in gallery tile worker');
    console.error(err);

    self.postMessage({ id, error: err.message || 'gtwe' }, [] as any);
  }
};
