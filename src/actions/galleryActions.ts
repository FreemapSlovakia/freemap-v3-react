import { PictureModel } from 'fm3/components/gallery/GalleryEditForm';
import { LatLon, User } from 'fm3/types/common';
import { createAction } from 'typesafe-actions';

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
  | '-rating'
  | '-lastCommentedAt';

export type GalleryColorizeBy =
  | 'userId'
  | 'takenAt'
  | 'createdAt'
  | 'rating'
  | 'mine';

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
  user: Pick<User, 'id' | 'name'>;
  comment: string;
}

export interface Picture extends LatLon {
  id: number;
  title: string | null;
  description: string | null;
  tags: string[];
  comments: PictureComment[];
  rating: number;
  myStars?: number | null;
  user: Pick<User, 'id' | 'name'>;
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

export const galleryRequestImages = createAction(
  'GALLERY_REQUEST_IMAGES',
)<LatLon>();

export const galleryRequestImage = createAction('GALLERY_REQUEST_IMAGE')<
  number | 'next' | 'prev'
>();

export const gallerySetImageIds = createAction('GALLERY_SET_IMAGE_IDS')<
  number[]
>();

export const gallerySetImage = createAction('GALLERY_SET_IMAGE')<Picture>();

export const galleryClear = createAction('GALLERY_CLEAR')();

export const galleryShowOnTheMap = createAction('GALLERY_SHOW_ON_THE_MAP')();

export const galleryCancelShowOnTheMap = createAction(
  'GALLERY_CANCEL_SHOW_ON_THE_MAP',
)();

export const galleryAddItem = createAction('GALLERY_ADD_ITEM')<GalleryItem>();

export const galleryRemoveItem = createAction('GALLERY_REMOVE_ITEM')<number>();

export const galleryMergeItem = createAction('GALLERY_SET_ITEM')<
  Pick<GalleryItem, 'id'> & Partial<GalleryItem>
>();

export const gallerySetItemError = createAction('GALLERY_SET_ITEM_ERROR')<{
  id: number;
  error: string;
}>();

export const gallerySetPickingPosition = createAction(
  'GALLERY_SET_PICKING_POSITION',
)<LatLon>();

export const galleryConfirmPickedPosition = createAction(
  'GALLERY_CONFIRM_PICKED_POSITION',
)();

export const gallerySetItemForPositionPicking = createAction(
  'GALLERY_SET_ITEM_FOR_POSITION_PICKING',
)<number | null>();

export const galleryUpload = createAction('GALLERY_UPLOAD')();

export const gallerySetLayerDirty = createAction('GALLERY_SET_LAYER_DIRTY')();

export const gallerySetTags = createAction('GALLERY_SET_TAGS')<GalleryTag[]>();

export const gallerySetUsers =
  createAction('GALLERY_SET_USERS')<GalleryUser[]>();

export const gallerySetComment = createAction('GALLERY_SET_COMMENT')<string>();

export const gallerySubmitComment = createAction('GALLERY_SUBMIT_COMMENT')();

export const gallerySubmitStars = createAction(
  'GALLERY_SUBMIT_STARS',
)<number>();

export const galleryEditPicture = createAction('GALLERY_EDIT_PICTURE')();

export const gallerySetEditModel = createAction(
  'GALLERY_SET_EDIT_MODEL',
)<PictureModel>();

export const galleryDeletePicture = createAction('GALLERY_DELETE_PICTURE')();

export const galleryShowFilter = createAction('GALLERY_SHOW_FILTER')();

export const galleryHideFilter = createAction('GALLERY_HIDE_FILTER')();

export const galleryShowUploadModal = createAction(
  'GALLERY_SHOW_UPLOAD_MODAL',
)();

export const galleryHideUploadModal = createAction(
  'GALLERY_HIDE_UPLOAD_MODAL',
)();

export const gallerySetFilter =
  createAction('GALLERY_SET_FILTER')<GalleryFilter>();

export const gallerySavePicture = createAction('GALLERY_SAVE_PICTURE')();

export const galleryList = createAction('GALLERY_LIST')<GalleryListOrder>();

export const galleryColorizeBy = createAction(
  'GALLERY_COLORIZE_BY',
)<GalleryColorizeBy | null>();

export const galleryToggleShowPreview = createAction(
  'GALLERY_TOGGLE_SHOW_PREVIEW',
)();
