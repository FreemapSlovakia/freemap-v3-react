import { createAction } from '@reduxjs/toolkit';
import { IsoDateSchema, type LatLon } from '@shared/types/common.js';
import z from 'zod';
import type { PictureModel } from '../components/GalleryEditForm.js';

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
  | '-createdAt'
  | '-takenAt'
  | '-rating'
  | '-lastCommentedAt';

export const GalleryColorizeBySchema = z.enum([
  'userId',
  'takenAt',
  'createdAt',
  'rating',
  'mine',
  'season',
  'premium',
]);

export type GalleryColorizeBy = z.infer<typeof GalleryColorizeBySchema>;

export const GalleryTagSchema = z.object({
  name: z.string(),
  count: z.number(),
});

export type GalleryTag = z.infer<typeof GalleryTagSchema>;

export const GalleryUserSchema = z.object({
  id: z.number(),
  name: z.string(),
  count: z.number(),
});

export type GalleryUser = z.infer<typeof GalleryUserSchema>;

const PictureUserSchema = z.object({
  id: z.number(),
  name: z.string(),
  hasPicture: z.boolean(),
});

export const PictureCommentSchema = z.object({
  id: z.number(),
  createdAt: IsoDateSchema,
  user: PictureUserSchema,
  comment: z.string(),
});

export type PictureComment = z.infer<typeof PictureCommentSchema>;

export const PictureSchema = z.object({
  id: z.number(),
  lat: z.number(),
  lon: z.number(),
  title: z.string().nullable(),
  description: z.string().nullable(),
  tags: z.array(z.string()),
  comments: z.array(PictureCommentSchema),
  rating: z.number(),
  myStars: z.number().nullish(),
  user: PictureUserSchema,
  createdAt: IsoDateSchema,
  takenAt: IsoDateSchema.nullable(),
  pano: z.boolean().optional(),
  premium: z.boolean().optional(),
  azimuth: z.number().nullish(),
  hmac: z.string().optional(),
});

export type Picture = z.infer<typeof PictureSchema>;

export const GalleryFilterSchema = z.object({
  tag: z.string().optional(),
  userId: z.number().optional(),
  takenAtFrom: IsoDateSchema.optional(),
  takenAtTo: IsoDateSchema.optional(),
  createdAtFrom: IsoDateSchema.optional(),
  createdAtTo: IsoDateSchema.optional(),
  ratingFrom: z.number().optional(),
  ratingTo: z.number().optional(),
  pano: z.boolean().optional(),
  premium: z.boolean().optional(),
});

export type GalleryFilter = z.infer<typeof GalleryFilterSchema>;

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

export const galleryToggleLegend = createAction<boolean | undefined>(
  'GALLERY_TOGGLE_LEGEND',
);
