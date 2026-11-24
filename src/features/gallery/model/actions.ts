import { createAction } from '@reduxjs/toolkit';
import { CommentSchema } from '@shared/comments.js';
import { IsoDateSchema, type LatLon } from '@shared/types/common.js';
import z from 'zod';
import type { PictureModel } from '../components/GalleryEditForm.js';
import {
  DEFAULT_PHOTO_LICENSE,
  type GalleryLicense,
  GalleryLicenseSchema,
} from '../licenses.js';
import type { Rotation } from '../rotation.js';
import type { TagRef } from '../tagRefs.js';

/** Map overlay-layer code for the photos layer. */
export const GALLERY_LAYER = 'I';

// Keys of `GalleryMessages` used to label item/edit-form validation failures.
export type GalleryValidationError =
  | 'missingPositionError'
  | 'invalidPositionError'
  | 'invalidTakenAt';

// An item error is either a validation key (resolved against `GalleryMessages`)
// or an upload failure shown verbatim, prefixed with `~`.
export type GalleryItemError = GalleryValidationError | `~${string}`;

export interface GalleryItem {
  id: number;
  title: string;
  description: string;
  tags: TagRef[];
  takenAt: Date | null;
  azimuth: number | null;
  dirtyPosition: string | '';
  premium: boolean;
  license: GalleryLicense;
  rotation: Rotation;
  errors: GalleryItemError[];
  previewKey?: object;
  file: File;
}

export type GalleryListOrder =
  | '-createdAt'
  | '-takenAt'
  | '-rating'
  | '-lastCommentedAt';

// Order matters: this is the order the colorize dropdown lists the modes (after
// the "None" entry). Source isn't a mode — own vs. Wikimedia is shown by the
// marble shape, independent of coloring.
export const GalleryColorizeBySchema = z.enum([
  'mine',
  'userId',
  'rating',
  'takenAt',
  'createdAt',
  'season',
  'premium',
  'license',
]);

export type GalleryColorizeBy = z.infer<typeof GalleryColorizeBySchema>;

export const PictureTagSchema = z.object({
  id: z.number(),
  name: z.string(),
  /** The name in the language asked for, where it differs. */
  label: z.string().nullish(),
  /** A plant's or animal's Latin name. */
  latin: z.string().nullish(),
});

export type PictureTag = z.infer<typeof PictureTagSchema>;

export const GalleryTagSchema = z.object({
  ...PictureTagSchema.shape,
  count: z.number(),
  synonyms: z.array(z.string()).default([]),
  parentId: z.number().nullable().default(null),
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
  premium: z.boolean(),
});

export const PictureSchema = z.object({
  id: z.number(),
  // 'gallery' (own photo) or 'wikimedia' (Commons). Absent → gallery.
  source: z.enum(['gallery', 'wikimedia']).default('gallery'),
  lat: z.number(),
  lon: z.number(),
  title: z.string().nullish(),
  // Absent for Wikimedia photos (fetched from the Commons API instead).
  description: z.string().nullish(),
  tags: z.array(z.string()),
  /** `tags` with ids and labels in the language asked for. */
  tagList: z.array(PictureTagSchema).optional(),
  comments: z.array(CommentSchema),
  rating: z.number(),
  myStars: z.number().nullish(),
  // Absent for Wikimedia photos (no local uploader).
  user: PictureUserSchema.nullish(),
  // Absent for Wikimedia photos (upload date not imported).
  createdAt: IsoDateSchema.nullish(),
  takenAt: IsoDateSchema.nullish(),
  pano: z.boolean().optional(),
  premium: z.boolean().optional(),
  azimuth: z.number().nullish(),
  hmac: z.string().optional(),
  // `.catch` (not `.default`) so an unrecognized/absent license from the server
  // falls back instead of throwing and breaking the whole viewer — matching the
  // "unknown → default" rule in getPhotoLicense()/the tile renderer.
  license: GalleryLicenseSchema.catch(DEFAULT_PHOTO_LICENSE),
  // Timestamp the current license took effect (latest license-history entry);
  // shown as "licensed under … since …" in the viewer.
  licenseSince: IsoDateSchema.nullish(),
  // Absent for Wikimedia photos.
  viewCount: z.number().optional(),
});

export type Picture = z.infer<typeof PictureSchema>;

export const GalleryFilterSchema = z.object({
  tagId: z.number().optional(),
  /** A tag's name, from an older link or saved map; '' for photos with none. */
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
  license: z.array(GalleryLicenseSchema).optional(),
  // Which photo sources to show. Undefined = both (gallery + wikimedia).
  sources: z.array(z.enum(['gallery', 'wikimedia'])).optional(),
});

export type GalleryFilter = z.infer<typeof GalleryFilterSchema>;
export const galleryAddTag = createAction<TagRef>('GALLERY_ADD_TAG');

/** The filter's tag, held by its name, found as this id; turns no layer on. */
export const galleryFilterTagResolved = createAction<number>(
  'GALLERY_FILTER_TAG_RESOLVED',
);

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

export const gallerySetImageFetchFailed = createAction(
  'GALLERY_SET_IMAGE_FETCH_FAILED',
);

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
  error: GalleryItemError;
}>('GALLERY_SET_ITEM_ERROR');

export const gallerySetPickingPosition = createAction<LatLon>(
  'GALLERY_SET_PICKING_POSITION',
);

export const gallerySetPickingAzimuth = createAction<number | null>(
  'GALLERY_SET_PICKING_AZIMUTH',
);

export const galleryConfirmPickedPosition = createAction(
  'GALLERY_CONFIRM_PICKED_POSITION',
);

export const gallerySetItemForPositionPicking = createAction<number | null>(
  'GALLERY_SET_ITEM_FOR_POSITION_PICKING',
);

export const galleryUpload = createAction('GALLERY_UPLOAD');

export const gallerySetLayerDirty = createAction('GALLERY_SET_LAYER_DIRTY');

/** Labels of the whole tag list wanted, where not loaded yet. */
export const galleryTagsNeeded = createAction('GALLERY_TAGS_NEEDED');

export const gallerySetTags = createAction<{
  tags: GalleryTag[];
  language: string;
}>('GALLERY_SET_TAGS');

export const gallerySetUsers = createAction<GalleryUser[]>('GALLERY_SET_USERS');

export const gallerySetComment = createAction<string>('GALLERY_SET_COMMENT');

export const gallerySubmitComment = createAction('GALLERY_SUBMIT_COMMENT');

export const galleryEditComment = createAction<{
  id: number;
  comment: string;
}>('GALLERY_EDIT_COMMENT');

export const galleryDeleteComment = createAction<number>(
  'GALLERY_DELETE_COMMENT',
);

export const gallerySubmitStars = createAction<number>('GALLERY_SUBMIT_STARS');

export const galleryEditPicture = createAction('GALLERY_EDIT_PICTURE');

export const gallerySetEditModel = createAction<PictureModel>(
  'GALLERY_SET_EDIT_MODEL',
);

export const galleryDeletePicture = createAction('GALLERY_DELETE_PICTURE');

export const gallerySetFilter =
  createAction<GalleryFilter>('GALLERY_SET_FILTER');

export const gallerySavePicture = createAction('GALLERY_SAVE_PICTURE');

export interface SavedRotation {
  rotation: Rotation;
  /** When saved; reloads the viewer's image past the one it shows. */
  at: number;
}

export const gallerySetSavedRotation = createAction<
  SavedRotation & { id: number }
>('GALLERY_SET_SAVED_ROTATION');

export const galleryList = createAction<GalleryListOrder>('GALLERY_LIST');

export const galleryColorizeBy = createAction<GalleryColorizeBy | null>(
  'GALLERY_COLORIZE_BY',
);

export const galleryToggleShowPreview = createAction(
  'GALLERY_TOGGLE_SHOW_PREVIEW',
);

/** Sets the premium flag on every current upload item, and the persisted default. */
export const galleryTogglePremium = createAction<boolean>(
  'GALLERY_TOGGLE_PREMIUM',
);

export const galleryQuickAddTag = createAction<TagRef>('GALLERY_QUICK_ADD_TAG');

export const galleryQuickChangePremium = createAction<boolean>(
  'GALLERY_QUICK_CHANGE_PREMIUM',
);

export const galleryAllPremiumOrFree = createAction<'premium' | 'free'>(
  'GALLERY_ALL_PREMIUM_OR_FREE',
);

/** Sets the license on every current upload item, and the persisted default. */
export const gallerySetLicense = createAction<GalleryLicense>(
  'GALLERY_SET_LICENSE',
);

/** Relicenses all of the current user's already-uploaded photos. */
export const galleryAllOfLicense = createAction<GalleryLicense>(
  'GALLERY_ALL_OF_LICENSE',
);

export const galleryToggleDirection = createAction<boolean | undefined>(
  'GALLERY_TOGGLE_DIRECTION',
);

export const galleryToggleLegend = createAction<boolean | undefined>(
  'GALLERY_TOGGLE_LEGEND',
);
