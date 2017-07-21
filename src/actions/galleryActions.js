export function galleryRequestImages(lat, lon) {
  return { type: 'GALLERY_REQUEST_IMAGES', payload: { lat, lon } };
}

export function galleryRequestImage(id) {
  return { type: 'GALLERY_REQUEST_IMAGE', payload: id };
}

export function gallerySetImages(images) {
  return { type: 'GALLERY_SET_IMAGES', payload: images };
}

export function gallerySetActiveImageId(activeImageId) {
  return { type: 'GALLERY_SET_ACTIVE_IMAGE_ID', payload: activeImageId };
}

export function galleryShowOnTheMap() {
  return { type: 'GALLERY_SHOW_ON_THE_MAP' };
}

export function galleryAddItems(items) {
  return { type: 'GALLERY_ADD_ITEMS', payload: items };
}

export function galleryRemoveItem(id) {
  return { type: 'GALLERY_REMOVE_ITEM', payload: id };
}

export function gallerySetTitle(id, title) {
  return { type: 'GALLERY_SET_TITLE', payload: { id, value: title } };
}

export function gallerySetDescription(id, description) {
  return { type: 'GALLERY_SET_DESCRIPTION', payload: { id, value: description } };
}

export function gallerySetPosition(id, position) {
  return { type: 'GALLERY_SET_POSITION', payload: { id, value: position } };
}
