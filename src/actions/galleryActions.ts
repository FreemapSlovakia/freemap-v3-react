import { createAction } from '@reduxjs/toolkit';
import type { PictureModel } from '../components/gallery/GalleryEditForm.js';
import type { User } from '../types/auth.js';
import type { LatLon } from '../types/common.js';

export interface GalleryItem {
  id: number;
  title: string;
  description: string;
  tags: string[];
  takenAt: Date | null;
  azimuth: number | null;
  dirtyPosition: string | '';
  premium: boolean;
  errors: string[];
  previewKey?: {};
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
  | 'mine'
  | 'season'
  | 'premium';

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
  pano?: 1;
  premium?: 1;
  azimuth?: number | null;
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
  pano?: boolean;
  premium?: boolean;
}

export const galleryAddTag = createAction<string>('GALLERY_ADD_TAG');

export const galleryRequestImages = createAction<LatLon>(
  'GALLERY_REQUEST_IMAGES',
);

export const galleryRequestImage = createAction<number | 'next' | 'prev'>(
  'GALLERY_REQUEST_IMAGE',
);

export const gallerySetImageIds = createAction<number[]>(
  'GALLERY_SET_IMAGE_IDS',
);

export const gallerySetImage = createAction<Picture>('GALLERY_SET_IMAGE');

export const galleryClear = createAction('GALLERY_CLEAR');

export const galleryShowOnTheMap = createAction('GALLERY_SHOW_ON_THE_MAP');

export const galleryCancelShowOnTheMap = createAction(
  'GALLERY_CANCEL_SHOW_ON_THE_MAP',
);

export const galleryAddItem = createAction<GalleryItem>('GALLERY_ADD_ITEM');

export const galleryRemoveItem = createAction<number>('GALLERY_REMOVE_ITEM');

export const galleryMergeItem = createAction<
  Pick<GalleryItem, 'id'> & Partial<GalleryItem>
>('GALLERY_SET_ITEM');

export const gallerySetItemError = createAction<{
  id: number;
  error: string;
}>('GALLERY_SET_ITEM_ERROR');

export const gallerySetPickingPosition = createAction<LatLon>(
  'GALLERY_SET_PICKING_POSITION',
);

export const galleryConfirmPickedPosition = createAction(
  'GALLERY_CONFIRM_PICKED_POSITION',
);

export const gallerySetItemForPositionPicking = createAction<number | null>(
  'GALLERY_SET_ITEM_FOR_POSITION_PICKING',
);

export const galleryUpload = createAction('GALLERY_UPLOAD');

export const gallerySetLayerDirty = createAction('GALLERY_SET_LAYER_DIRTY');

export const gallerySetTags = createAction<GalleryTag[]>('GALLERY_SET_TAGS');

export const gallerySetUsers = createAction<GalleryUser[]>('GALLERY_SET_USERS');

export const gallerySetComment = createAction<string>('GALLERY_SET_COMMENT');

export const gallerySubmitComment = createAction('GALLERY_SUBMIT_COMMENT');

export const gallerySubmitStars = createAction<number>('GALLERY_SUBMIT_STARS');

export const galleryEditPicture = createAction('GALLERY_EDIT_PICTURE');

export const gallerySetEditModel = createAction<PictureModel>(
  'GALLERY_SET_EDIT_MODEL',
);

export const galleryDeletePicture = createAction('GALLERY_DELETE_PICTURE');

export const gallerySetFilter =
  createAction<GalleryFilter>('GALLERY_SET_FILTER');

export const gallerySavePicture = createAction('GALLERY_SAVE_PICTURE');

export const galleryList = createAction<GalleryListOrder>('GALLERY_LIST');

export const galleryColorizeBy = createAction<GalleryColorizeBy | null>(
  'GALLERY_COLORIZE_BY',
);

export const galleryToggleShowPreview = createAction(
  'GALLERY_TOGGLE_SHOW_PREVIEW',
);

export const galleryTogglePremium = createAction('GALLERY_TOGGLE_PREMIUM');

export const galleryQuickAddTag = createAction<string>('GALLERY_QUICK_ADD_TAG');

export const galleryQuickChangePremium = createAction<boolean>(
  'GALLERY_QUICK_CHANGE_PREMIUM',
);

export const galleryAllPremiumOrFree = createAction<'premium' | 'free'>(
  'GALLERY_ALL_PREMIUM_OR_FREE',
);

export const galleryToggleDirection = createAction<boolean | undefined>(
  'GALLERY_TOGGLE_DIRECTION',
);
