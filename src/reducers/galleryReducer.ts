import { createReducer, isAnyOf } from '@reduxjs/toolkit';
import {
  galleryAddItem,
  galleryAddTag,
  galleryCancelShowOnTheMap,
  galleryClear,
  galleryColorizeBy,
  GalleryColorizeBy,
  galleryConfirmPickedPosition,
  galleryEditPicture,
  GalleryFilter,
  GalleryItem,
  galleryMergeItem,
  galleryQuickAddTag,
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
  gallerySetPickingPosition,
  gallerySetTags,
  gallerySetUsers,
  galleryShowOnTheMap,
  GalleryTag,
  galleryTogglePremium,
  galleryToggleShowPreview,
  galleryUpload,
  GalleryUser,
  Picture,
} from '../actions/galleryActions.js';
import { l10nSetLanguage } from '../actions/l10nActions.js';
import { clearMapFeatures, setActiveModal } from '../actions/mainActions.js';
import { mapRefocus } from '../actions/mapActions.js';
import { mapsLoaded } from '../actions/mapsActions.js';
import { PictureModel } from '../components/gallery/GalleryEditForm.js';
import { parseCoordinates } from '../coordinatesParser.js';
import { toDatetimeLocal } from '../dateUtils.js';
import { latLonToString } from '../geoutils.js';
import { LatLon } from '../types/common.js';

export interface GalleryState {
  imageIds: number[] | null;
  activeImageId: number | null;
  image: Picture | null;
  items: GalleryItem[];
  pickingPositionForId: number | null;
  pickingPosition: LatLon | null;
  showPreview: boolean;
  premium: boolean;
  uploadingId: number | null;
  tags: GalleryTag[];
  users: GalleryUser[];
  dirtySeq: number;
  comment: string;
  filter: GalleryFilter;
  editModel: PictureModel | null;
  showPosition: boolean;
  language: string;
  saveErrors: string[];
  colorizeBy: GalleryColorizeBy | null;
  recentTags: string[];
}

export const galleryInitialState: GalleryState = {
  imageIds: null,
  activeImageId: null,
  image: null,

  items: [],
  pickingPositionForId: null,
  pickingPosition: null,
  showPreview: true,
  premium: true,

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
  colorizeBy: null,
  recentTags: [],
};

export const galleryReducer = createReducer(galleryInitialState, (builder) =>
  builder
    .addCase(mapRefocus, (state, action) => {
      if (action.payload.overlays && !action.payload.overlays.includes('I')) {
        state.filter = galleryInitialState.filter;
      }
    })
    .addCase(clearMapFeatures, (state) => ({
      ...galleryInitialState,
      dirtySeq: state.dirtySeq,
      colorizeBy: state.colorizeBy,
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

        if (imageIds) {
          const index = imageIds.findIndex((id) => id === activeImageId);

          if (index + 1 < imageIds.length) {
            set(imageIds[index + 1]);
          }
        }
      } else if (action.payload === 'prev') {
        const { imageIds, activeImageId } = state;

        if (imageIds) {
          const index = imageIds.findIndex((id) => id === activeImageId);

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

      if (state.items) {
        const len = state.items.filter((item) => item.premium).length;

        state.premium =
          len === 0 ? false : len === state.items.length ? true : state.premium;
      }
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

      let x;

      state.pickingPosition =
        action.payload === -1
          ? state.editModel
            ? safeParseCoordinates(state.editModel.dirtyPosition)
            : null
          : typeof action.payload === 'number'
            ? // eslint-disable-next-line no-cond-assign
              (x = state.items.find(({ id }) => id === action.payload))
              ? safeParseCoordinates(x.dirtyPosition)
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
            premium: Boolean(state.image?.premium),
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
    .addCase(galleryTogglePremium, (state) => {
      state.premium = !state.premium;

      for (const item of state.items) {
        item.premium = state.premium;
      }
    })
    .addCase(l10nSetLanguage, (state, action) => {
      state.language = action.payload;
    })
    .addCase(gallerySavePicture, (state) => {
      state.saveErrors = state.editModel ? getErrors(state.editModel) : [];
    })
    .addCase(galleryColorizeBy, (state, action) => {
      state.colorizeBy = action.payload;
    })
    .addCase(mapsLoaded, (state, action) => {
      state.filter =
        action.payload.data.galleryFilter ?? galleryInitialState.filter;
    })
    .addMatcher(
      isAnyOf(galleryAddTag, galleryQuickAddTag),
      (state, { payload }) => {
        const i = state.recentTags.indexOf(payload);

        if (i > -1) {
          state.recentTags.splice(i, 1);
        }

        state.recentTags.unshift(payload);

        state.recentTags.splice(8);
      },
    ),
);

function getErrors(item: GalleryItem | PictureModel) {
  const errors: string[] = [];

  if (!item.dirtyPosition) {
    errors.push('gallery.missingPositionError');
  } else {
    try {
      parseCoordinates(item.dirtyPosition);
    } catch {
      errors.push('gallery.invalidPositionError');
    }
  }

  if (
    (item.takenAt instanceof Date && Number.isNaN(item.takenAt.getTime())) ||
    (item.takenAt &&
      typeof item.takenAt === 'string' &&
      Number.isNaN(new Date(item.takenAt).getTime()))
  ) {
    errors.push('gallery.invalidTakenAt');
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
