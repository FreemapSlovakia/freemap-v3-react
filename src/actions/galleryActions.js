export function galleryRequestImages(lat, lon) {
  return { type: 'GALLERY_REQUEST_IMAGES', payload: { lat, lon } };
}

export function gallerySetImages(images) {
  return { type: 'GALLERY_SET_IMAGES', payload: images };
}
