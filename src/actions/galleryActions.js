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

export function galleryAddItem(item) {
  return { type: 'GALLERY_ADD_ITEM', payload: item };
}

export function galleryRemoveItem(id) {
  return { type: 'GALLERY_REMOVE_ITEM', payload: id };
}

export function gallerySetItemUrl(id, url) {
  return { type: 'GALLERY_SET_ITEM_URL', payload: { id, value: url } };
}

export function gallerySetItemTitle(id, title) {
  return { type: 'GALLERY_SET_ITEM_TITLE', payload: { id, value: title } };
}

export function gallerySetItemDescription(id, description) {
  return { type: 'GALLERY_SET_ITEM_DESCRIPTION', payload: { id, value: description } };
}

export function gallerySetItemTimestamp(id, timestamp) {
  return { type: 'GALLERY_SET_ITEM_TIMESTAMP', payload: { id, value: timestamp } };
}

export function gallerySetItemError(id, error) {
  return { type: 'GALLERY_SET_ITEM_ERROR', payload: { id, value: error } };
}

export function gallerySetPickingPosition(lat, lon) {
  return { type: 'GALLERY_SET_PICKING_POSITION', payload: { lat, lon } };
}

export function galleryConfirmPickedPosition() {
  return { type: 'GALLERY_CONFIRM_PICKED_POSITION' };
}

export function gallerySetItemForPositionPicking(id) {
  return { type: 'GALLERY_SET_ITEM_FOR_POSITION_PICKING', payload: id };
}

export function galleryUpload() {
  return { type: 'GALLERY_UPLOAD' };
}

export function galleryUploadFinished() {
  return { type: 'GALLERY_UPLOAD_FINISHED' };
}
