import * as at from 'fm3/actionTypes';

export function galleryRequestImages(lat, lon) {
  return { type: at.GALLERY_REQUEST_IMAGES, payload: { lat, lon } };
}

export function galleryRequestImage(id) {
  return { type: at.GALLERY_REQUEST_IMAGE, payload: id };
}

export function gallerySetImageIds(imageIds) {
  return { type: at.GALLERY_SET_IMAGE_IDS, payload: imageIds };
}

export function gallerySetImage(image) {
  return { type: at.GALLERY_SET_IMAGE, payload: image };
}

export function galleryClear() {
  return { type: at.GALLERY_CLEAR };
}

export function galleryShowOnTheMap(show) {
  return { type: show ? at.GALLERY_SHOW_ON_THE_MAP : at.GALLERY_CANCEL_SHOW_ON_THE_MAP };
}

export function galleryAddItem(item) {
  return { type: at.GALLERY_ADD_ITEM, payload: item };
}

export function galleryRemoveItem(id) {
  return { type: at.GALLERY_REMOVE_ITEM, payload: id };
}

export function gallerySetItem(id, item) {
  return { type: at.GALLERY_SET_ITEM, payload: { id, value: item } };
}

export function gallerySetItemError(id, error) {
  return { type: at.GALLERY_SET_ITEM_ERROR, payload: { id, error } };
}

export function gallerySetPickingPosition(lat, lon) {
  return { type: at.GALLERY_SET_PICKING_POSITION, payload: { lat, lon } };
}

export function galleryConfirmPickedPosition() {
  return { type: at.GALLERY_CONFIRM_PICKED_POSITION };
}

export function gallerySetItemForPositionPicking(id) {
  return { type: at.GALLERY_SET_ITEM_FOR_POSITION_PICKING, payload: id };
}

export function galleryUpload() {
  return { type: at.GALLERY_UPLOAD };
}

export function gallerySetLayerDirty() {
  return { type: at.GALLERY_SET_LAYER_DIRTY };
}

export function gallerySetTags(tags) {
  return { type: at.GALLERY_SET_TAGS, payload: tags };
}

export function gallerySetUsers(users) {
  return { type: at.GALLERY_SET_USERS, payload: users };
}

export function gallerySetComment(comment) {
  return { type: at.GALLERY_SET_COMMENT, payload: comment };
}

export function gallerySubmitComment() {
  return { type: at.GALLERY_SUBMIT_COMMENT };
}

export function gallerySubmitStars(stars) {
  return { type: at.GALLERY_SUBMIT_STARS, payload: stars };
}

export function galleryEditPicture() {
  return { type: at.GALLERY_EDIT_PICTURE };
}

export function gallerySetEditModel(editModel) {
  return { type: at.GALLERY_SET_EDIT_MODEL, payload: editModel };
}

export function galleryDeletePicture() {
  return { type: at.GALLERY_DELETE_PICTURE };
}

export function galleryShowFilter() {
  return { type: at.GALLERY_SHOW_FILTER };
}

export function galleryHideFilter() {
  return { type: at.GALLERY_HIDE_FILTER };
}

export function galleryShowUploadModal() {
  return { type: at.GALLERY_SHOW_UPLOAD_MODAL };
}

export function galleryHideUploadModal() {
  return { type: at.GALLERY_HIDE_UPLOAD_MODAL };
}

export function gallerySetFilter(filter) {
  return { type: at.GALLERY_SET_FILTER, payload: filter };
}

export function gallerySavePicture() {
  return { type: at.GALLERY_SAVE_PICTURE };
}

export function galleryList(orderBy) {
  return { type: at.GALLERY_LIST, payload: orderBy };
}

export function galleryLayerHint() {
  return { type: at.GALLERY_PREVENT_LAYER_HINT };
}
export function galleryHideGalleryOverlayOnToolLeave(hideOnLeave) {
  return { type: at.GALLERY_HIDE_GALLERY_OVERLAY_ON_TOOL_LEAVE, payload: hideOnLeave };
}
