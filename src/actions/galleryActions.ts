import { createAction, createStandardAction } from 'typesafe-actions';
import { LatLon, User } from 'fm3/types/common';
import { PictureModel } from 'fm3/components/gallery/GalleryEditForm';

export interface GalleryItem {
  id: number;
  title: string;
  description: string;
  tags: string[];
  takenAt: Date | null;
  // position: LatLon | null;
  dirtyPosition: string | '';
  errors: string[];
  url?: string;
  file: File;
}

export type GalleryListOrder =
  | '+createdAt'
  | '-createdAt'
  | '+takenAt'
  | '-takenAt'
  | '+rating'
  | '-rating';

export interface GalleryTag {
  name: string;
  count: number;
}

export interface GalleryUser {
  id: number;
  name: string;
  count: number;
}

export interface PictureComment {
  id: number;
  createdAt: Date;
  user: User;
  comment: string;
}

export interface Picture extends LatLon {
  id: number;
  title: string;
  description: string;
  tags: string[];
  comments: PictureComment[];
  rating: number;
  myStars: number;
  user: User;
  createdAt: Date;
  takenAt: Date | null;
}

export interface GalleryFilter {
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
)<number | 'next' | 'prev'>();

export const gallerySetImageIds = createStandardAction('GALLERY_SET_IMAGE_IDS')<
  number[]
>();

export const gallerySetImage = createStandardAction('GALLERY_SET_IMAGE')<
  Picture
>();

export const galleryClear = createAction('GALLERY_CLEAR');

export const galleryShowOnTheMap = createAction('GALLERY_SHOW_ON_THE_MAP');

export const galleryCancelShowOnTheMap = createAction(
  'GALLERY_CANCEL_SHOW_ON_THE_MAP',
);

export const galleryAddItem = createStandardAction('GALLERY_ADD_ITEM')<
  GalleryItem
>();

export const galleryRemoveItem = createStandardAction('GALLERY_REMOVE_ITEM')<
  number
>();

export const galleryMergeItem = createStandardAction('GALLERY_SET_ITEM')<
  Pick<GalleryItem, 'id'> & Partial<GalleryItem>
>();

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
)<number | null>();

export const galleryUpload = createAction('GALLERY_UPLOAD');

export const gallerySetLayerDirty = createAction('GALLERY_SET_LAYER_DIRTY');

export const gallerySetTags = createStandardAction('GALLERY_SET_TAGS')<
  GalleryTag[]
>();

export const gallerySetUsers = createStandardAction('GALLERY_SET_USERS')<
  GalleryUser[]
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
)<PictureModel>();

export const galleryDeletePicture = createAction('GALLERY_DELETE_PICTURE');

export const galleryShowFilter = createAction('GALLERY_SHOW_FILTER');

export const galleryHideFilter = createAction('GALLERY_HIDE_FILTER');

export const galleryShowUploadModal = createAction('GALLERY_SHOW_UPLOAD_MODAL');

export const galleryHideUploadModal = createAction('GALLERY_HIDE_UPLOAD_MODAL');

export const gallerySetFilter = createStandardAction('GALLERY_SET_FILTER')<
  GalleryFilter
>();

export const gallerySavePicture = createAction('GALLERY_SAVE_PICTURE');

export const galleryList = createStandardAction('GALLERY_LIST')<
  GalleryListOrder
>();

export const galleryPreventLayerHint = createAction(
  'GALLERY_PREVENT_LAYER_HINT',
);

export const galleryToggleShowPreview = createAction(
  'GALLERY_TOGGLE_SHOW_PREVIEW',
);
