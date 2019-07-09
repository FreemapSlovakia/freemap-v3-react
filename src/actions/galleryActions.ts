import { createAction, createStandardAction } from 'typesafe-actions';
import { LatLon, IUser } from 'fm3/types/common';

export type GalleryListOrder =
  | '+createdAt'
  | '-createdAt'
  | '+takenAt'
  | '-takenAt'
  | '+rating'
  | '-rating';

export interface IGalleryTag {
  name: string;
  count: number;
}

export interface IGalleryUser {
  id: number;
  name: string;
  count: number;
}

export interface IPictureComment {
  id: number;
  createdAt: Date;
  user: IUser;
  comment: string;
}

export interface IPicture extends LatLon {
  title: string;
  description: string;
  createdAt: Date;
  takenAt: Date;
  tags: string[];
  comments: IPictureComment[];
  rating: number;
  myStars: number;
  user: IUser;
}

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
  IGalleryTag[]
>();

export const gallerySetUsers = createStandardAction('GALLERY_SET_USERS')<
  IGalleryUser[]
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
  GalleryListOrder
>();

export const galleryLayerHint = createAction('GALLERY_PREVENT_LAYER_HINT');

export const galleryToggleShowPreview = createAction(
  'GALLERY_TOGGLE_SHOW_PREVIEW',
);
