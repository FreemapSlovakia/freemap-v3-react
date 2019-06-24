import { createAction, createStandardAction } from 'typesafe-actions';
import { LatLon } from 'fm3/types/common';

interface IPicture {}

export interface IGalleryFilter {
  tag?: string;
  userId?: number;
  takenAtFrom?: Date;
  takenAtTo?: Date;
  createdAtFrom?: Date;
  createdAtTo?: Date;
  ratingFrom?: number;
  ratingTo?: number;
}

export const galleryRequestImages = createStandardAction(
  'GALLERY_REQUEST_IMAGES',
)<LatLon>();

export const galleryRequestImage = createStandardAction(
  'GALLERY_REQUEST_IMAGE',
)<number>();

export const gallerySetImageIds = createStandardAction('GALLERY_SET_IMAGE_IDS')<
  number[]
>();

export const gallerySetImage = createStandardAction('GALLERY_SET_IMAGE')<
  IPicture
>();

export const galleryClear = createAction('GALLERY_CLEAR');

export const galleryShowOnTheMap = createAction('GALLERY_SHOW_ON_THE_MAP');

export const galleryCancelShowOnTheMap = createAction(
  'GALLERY_CANCEL_SHOW_ON_THE_MAP',
);

export const galleryAddItem = createStandardAction('GALLERY_ADD_ITEM')<
  IPicture
>();

export const galleryRemoveItem = createStandardAction('GALLERY_REMOVE_ITEM')<
  number
>();

export const gallerySetItem = createStandardAction('GALLERY_SET_ITEM')<{
  id: number;
  item: IPicture;
}>();

export const gallerySetItemError = createStandardAction(
  'GALLERY_SET_ITEM_ERROR',
)<{ id: number; error: string }>();

export const gallerySetPickingPosition = createStandardAction(
  'GALLERY_SET_PICKING_POSITION',
)<LatLon>();

export const galleryConfirmPickedPosition = createAction(
  'GALLERY_CONFIRM_PICKED_POSITION',
);

export const gallerySetItemForPositionPicking = createStandardAction(
  'GALLERY_SET_ITEM_FOR_POSITION_PICKING',
)<number>();

export const galleryUpload = createAction('GALLERY_UPLOAD');

export const gallerySetLayerDirty = createAction('GALLERY_SET_LAYER_DIRTY');

export const gallerySetTags = createStandardAction('GALLERY_SET_TAGS')<
  string[]
>();

export const gallerySetUsers = createStandardAction('GALLERY_SET_USERS')<
  Array<{
    id: number;
    name: string;
  }>
>();

export const gallerySetComment = createStandardAction('GALLERY_SET_COMMENT')<
  string
>();

export const gallerySubmitComment = createAction('GALLERY_SUBMIT_COMMENT');

export const gallerySubmitStars = createStandardAction('GALLERY_SUBMIT_STARS')<
  number
>();

export const galleryEditPicture = createAction('GALLERY_EDIT_PICTURE');

export const gallerySetEditModel = createStandardAction(
  'GALLERY_SET_EDIT_MODEL',
)<IPicture>();

export const galleryDeletePicture = createAction('GALLERY_DELETE_PICTURE');

export const galleryShowFilter = createAction('GALLERY_SHOW_FILTER');

export const galleryHideFilter = createAction('GALLERY_HIDE_FILTER');

export const galleryShowUploadModal = createAction('GALLERY_SHOW_UPLOAD_MODAL');

export const galleryHideUploadModal = createAction('GALLERY_HIDE_UPLOAD_MODAL');

export const gallerySetFilter = createStandardAction('GALLERY_SET_FILTER')<
  IGalleryFilter
>();

export const gallerySavePicture = createAction('GALLERY_SAVE_PICTURE');

export const galleryList = createStandardAction('GALLERY_LIST')<
  '+createdAt' | '-createdAt' | '+takenAt' | '-takenAt' | '+rating' | '-rating'
>(); // TODO enum

export const galleryLayerHint = createAction('GALLERY_PREVENT_LAYER_HINT');

export const galleryToggleShowPreview = createAction(
  'GALLERY_TOGGLE_SHOW_PREVIEW',
);
