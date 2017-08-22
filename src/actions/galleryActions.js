export function galleryRequestImages(lat, lon) {
  return { type: 'GALLERY_REQUEST_IMAGES', payload: { lat, lon } };
}

export function galleryRequestImage(id) {
  return { type: 'GALLERY_REQUEST_IMAGE', payload: id };
}

export function gallerySetImageIds(imageIds) {
  return { type: 'GALLERY_SET_IMAGE_IDS', payload: imageIds };
}

export function gallerySetImage(image) {
  return { type: 'GALLERY_SET_IMAGE', payload: image };
}

export function galleryClear() {
  return { type: 'GALLERY_CLEAR' };
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

export function gallerySetItemIsUploaded(id) {
  return { type: 'GALLERY_SET_ITEM_IS_UPLOADED', payload: id };
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

export function gallerySetItemTakenAt(id, takenAt) {
  return { type: 'GALLERY_SET_ITEM_TAKEN_AT', payload: { id, value: takenAt } };
}

export function gallerySetItemTags(id, tags) {
  return { type: 'GALLERY_SET_ITEM_TAGS', payload: { id, value: tags } };
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

export function gallerySetLayerDirty() {
  return { type: 'GALLERY_SET_LAYER_DIRTY' };
}

export function gallerySetTags(tags) {
  return { type: 'GALLERY_SET_TAGS', payload: tags };
}

export function gallerySetComment(comment) {
  return { type: 'GALLERY_SET_COMMENT', payload: comment };
}

export function gallerySubmitComment() {
  return { type: 'GALLERY_SUBMIT_COMMENT' };
}

export function gallerySubmitStars(stars) {
  return { type: 'GALLERY_SUBMIT_STARS', payload: stars };
}

export function galleryDeletePicture() {
  return { type: 'GALLERY_DELETE_PICTURE' };
}

export function gallerySetFilterShown(show) {
  return { type: 'GALLERY_SET_FILTER_SHOWN', payload: show };
}
