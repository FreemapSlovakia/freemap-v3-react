import { clearMapFeatures, setActiveModal } from '@app/store/actions.js';
import { l10nSetLanguage } from '@features/l10n/model/actions.js';
import { mapRefocus } from '@features/map/model/actions.js';
import { mapsLoaded } from '@features/myMaps/model/actions.js';
import { createReducer } from '@reduxjs/toolkit';
import { parseCoordinates } from '@shared/coordinatesParser.js';
import { toDatetimeLocal } from '@shared/dateUtils.js';
import { latLonToString } from '@shared/geoutils.js';
import type { LatLon } from '@shared/types/common.js';
import type { PictureModel } from '../components/GalleryEditForm.js';
import { DEFAULT_PHOTO_LICENSE } from '../licenses.js';
import {
  type GalleryFilter,
  type GalleryItem,
  type GalleryItemError,
  type GalleryTag,
  type GalleryUser,
  type GalleryValidationError,
  galleryAddItem,
  galleryCancelShowOnTheMap,
  galleryClear,
  galleryConfirmPickedPosition,
  galleryEditPicture,
  galleryMergeItem,
  galleryRemoveItem,
  galleryRequestImage,
  gallerySavePicture,
  gallerySetComment,
  gallerySetEditModel,
  gallerySetFilter,
  gallerySetImage,
  gallerySetImageIds,
  gallerySetItemError,
  gallerySetItemForPositionPicking,
  gallerySetLayerDirty,
  gallerySetLicense,
  gallerySetPickingPosition,
  gallerySetTags,
  gallerySetUsers,
  galleryShowOnTheMap,
  galleryTogglePremium,
  galleryToggleShowPreview,
  galleryUpload,
  type Picture,
} from './actions.js';

export interface GalleryState {
  imageIds: number[] | null;
  activeImageId: number | null;
  image: Picture | null;
  items: GalleryItem[];
  pickingPositionForId: number | null;
  pickingPosition: LatLon | null;
  showPreview: boolean;
  uploadingId: number | null;
  tags: GalleryTag[];
  users: GalleryUser[];
  dirtySeq: number;
  comment: string;
  filter: GalleryFilter;
  editModel: PictureModel | null;
  showPosition: boolean;
  language: string;
  saveErrors: GalleryItemError[];
}

export const galleryInitialState: GalleryState = {
  imageIds: null,
  activeImageId: null,
  image: null,

  items: [],
  pickingPositionForId: null,
  pickingPosition: null,
  showPreview: false,

  uploadingId: null,

  tags: [],
  users: [],

  dirtySeq: 0,
  comment: '',
  filter: {
    tag: undefined,
    userId: undefined,
    takenAtFrom: undefined,
    takenAtTo: undefined,
    createdAtFrom: undefined,
    createdAtTo: undefined,
    ratingFrom: undefined,
    ratingTo: undefined,
  },

  editModel: null,
  saveErrors: [],
  showPosition: false,
  language: 'en-US', // TODO this is hack so that setLanguage will change it in any case on load (eg. to 'en')
};

export const galleryReducer = createReducer(galleryInitialState, (builder) =>
  builder
    .addCase(mapRefocus, (state, action) => {
      if (action.payload.layers && !action.payload.layers.includes('I')) {
        state.filter = galleryInitialState.filter;
      }
    })
    .addCase(clearMapFeatures, (state) => ({
      ...galleryInitialState,
      // `dirtySeq` is a render counter, not a pref; carry it across a clear.
      dirtySeq: state.dirtySeq,
      // The filter is a lens over the still-present photos layer, not a map
      // feature — a clear must not silently drop it. It resets on its own when
      // the layer is turned off (see `mapRefocus`).
      filter: state.filter,
    }))
    .addCase(gallerySetImageIds, (state, action) => ({
      ...state,
      imageIds: action.payload,
    }))
    .addCase(galleryClear, (state) => ({
      ...state,
      imageIds: null,
      image: null,
      activeImageId: null,
      editModel: null,
    }))
    .addCase(gallerySetImage, (state, action) => ({
      ...state,
      image: action.payload,
      editModel: null,
    }))
    .addCase(galleryRequestImage, (state, action) => {
      const set = (activeImageId: number) => {
        Object.assign(state, {
          activeImageId,
          comment: '',
          editModel: null,
        });
      };

      if (action.payload === 'next') {
        const { imageIds, activeImageId } = state;

        if (imageIds && activeImageId !== null) {
          const index = imageIds.indexOf(activeImageId);

          if (index + 1 < imageIds.length) {
            set(imageIds[index + 1]);
          }
        }
      } else if (action.payload === 'prev') {
        const { imageIds, activeImageId } = state;

        if (imageIds && activeImageId !== null) {
          const index = imageIds.indexOf(activeImageId);

          if (index > 0) {
            set(imageIds[index - 1]);
          }
        }
      } else {
        set(action.payload);
      }
    })
    .addCase(galleryAddItem, (state, action) => {
      state.items.push(action.payload);
    })
    .addCase(galleryRemoveItem, (state, action) => {
      state.items = state.items.filter(({ id }) => action.payload !== id);
    })
    .addCase(galleryMergeItem, (state, action) => {
      state.items = state.items.map((item) =>
        item.id === action.payload.id ? { ...item, ...action.payload } : item,
      );
    })
    .addCase(gallerySetItemError, (state, action) => {
      const item = state.items.find((item) => item.id === action.payload.id);

      if (item) {
        item.errors = [action.payload.error];
      }
    })
    .addCase(gallerySetPickingPosition, (state, action) => {
      state.pickingPosition = action.payload;
    })
    .addCase(galleryConfirmPickedPosition, (state) => {
      if (state.pickingPositionForId === -1) {
        if (!state.editModel) {
          throw new Error('editModel is null');
        }

        state.editModel.dirtyPosition = state.pickingPosition
          ? latLonToString(state.pickingPosition, state.language)
          : state.editModel.dirtyPosition; // TODO language
      } else {
        const item = state.items.find(
          (item) => item.id === state.pickingPositionForId,
        );

        if (item) {
          item.dirtyPosition = state.pickingPosition
            ? latLonToString(state.pickingPosition, state.language)
            : '';
        }
      }

      state.pickingPositionForId = null;

      state.pickingPosition = null;
    })
    .addCase(gallerySetItemForPositionPicking, (state, action) => {
      state.pickingPositionForId = action.payload;

      const item =
        typeof action.payload === 'number' && action.payload !== -1
          ? state.items.find(({ id }) => id === action.payload)
          : undefined;

      state.pickingPosition =
        action.payload === -1
          ? state.editModel
            ? safeParseCoordinates(state.editModel.dirtyPosition)
            : null
          : typeof action.payload === 'number'
            ? item
              ? safeParseCoordinates(item.dirtyPosition)
              : null
            : null;
    })
    .addCase(galleryUpload, (state) => {
      const items =
        state.uploadingId === null
          ? state.items.map((item) => ({ ...item, errors: getErrors(item) }))
          : state.items;

      const next = items.find(
        (item) => !item.errors || item.errors.length === 0,
      );

      state.items = items;

      state.uploadingId = next ? next.id : null;
    })
    .addCase(gallerySetTags, (state, action) => {
      state.tags = action.payload;
    })
    .addCase(gallerySetUsers, (state, action) => {
      state.users = action.payload;
    })
    .addCase(gallerySetLayerDirty, (state) => {
      state.dirtySeq = state.dirtySeq + 1;
    })
    .addCase(gallerySetComment, (state, action) => {
      state.comment = action.payload;
    })
    .addCase(gallerySetFilter, (state, action) => {
      state.filter = action.payload;
    })
    .addCase(setActiveModal, (state, action) => {
      if (action.payload === null) {
        state.items = [];

        state.pickingPositionForId = null;
      }
    })
    .addCase(galleryEditPicture, (state) => {
      const position = state.image
        ? { lat: state.image.lat, lon: state.image.lon }
        : null;

      state.editModel = state.editModel
        ? null
        : {
            title: state.image?.title ?? '',
            description: state.image?.description ?? '',
            takenAt: !state.image
              ? ''
              : state.image.takenAt
                ? toDatetimeLocal(state.image.takenAt)
                : '',
            tags: state.image ? [...state.image.tags] : [],
            dirtyPosition: position
              ? latLonToString(position, state.language)
              : '',
            azimuth:
              typeof state.image?.azimuth === 'number'
                ? String(state.image.azimuth)
                : '',
            premium: Boolean(state.image?.premium),
            license: state.image?.license ?? DEFAULT_PHOTO_LICENSE,
          };
    })
    .addCase(gallerySetEditModel, (state, action) => {
      state.editModel = action.payload;
    })
    .addCase(galleryShowOnTheMap, (state) => {
      state.showPosition = true;
    })
    .addCase(galleryCancelShowOnTheMap, (state) => {
      state.showPosition = false;
    })
    .addCase(galleryToggleShowPreview, (state) => {
      state.showPreview = !state.showPreview;
    })
    .addCase(galleryTogglePremium, (state, action) => {
      for (const item of state.items) {
        item.premium = action.payload;
      }
    })
    .addCase(gallerySetLicense, (state, action) => {
      for (const item of state.items) {
        item.license = action.payload;
      }
    })
    .addCase(l10nSetLanguage, (state, action) => {
      state.language = action.payload;
    })
    .addCase(gallerySavePicture, (state) => {
      state.saveErrors = state.editModel ? getErrors(state.editModel) : [];
    })
    .addCase(mapsLoaded, (state, action) => {
      state.filter =
        action.payload.data.galleryFilter ?? galleryInitialState.filter;
    }),
);

function getErrors(item: GalleryItem | PictureModel) {
  const errors: GalleryValidationError[] = [];

  if (!item.dirtyPosition) {
    errors.push('missingPositionError');
  } else {
    try {
      parseCoordinates(item.dirtyPosition);
    } catch {
      errors.push('invalidPositionError');
    }
  }

  if (
    (item.takenAt instanceof Date && Number.isNaN(item.takenAt.getTime())) ||
    (item.takenAt &&
      typeof item.takenAt === 'string' &&
      Number.isNaN(new Date(item.takenAt).getTime()))
  ) {
    errors.push('invalidTakenAt');
  }

  return errors;
}

function safeParseCoordinates(coords: string) {
  try {
    return parseCoordinates(coords);
  } catch {
    return null;
  }
}
