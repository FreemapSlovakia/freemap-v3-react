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

export function gallerySetItem(id, item) {
  return { type: 'GALLERY_SET_ITEM', payload: { id, value: item } };
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

export function gallerySetUsers(users) {
  return { type: 'GALLERY_SET_USERS', payload: users };
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

export function galleryShowFilter() {
  return { type: 'GALLERY_SHOW_FILTER' };
}

export function galleryHideFilter() {
  return { type: 'GALLERY_HIDE_FILTER' };
}

export function galleryShowUploadModal() {
  return { type: 'GALLERY_SHOW_UPLOAD_MODAL' };
}

export function galleryHideUploadModal() {
  return { type: 'GALLERY_HIDE_UPLOAD_MODAL' };
}

export function gallerySetFilter(filter) {
  return { type: 'GALLERY_SET_FILTER', payload: filter };
}
