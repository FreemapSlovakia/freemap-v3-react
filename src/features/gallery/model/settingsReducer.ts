import { mapGalleryFilter } from '@app/url/mapContentParts.js';
import { mapsLoaded } from '@features/myMaps/model/actions.js';
import { createReducer, isAnyOf } from '@reduxjs/toolkit';
import { DEFAULT_PHOTO_LICENSE, type GalleryLicense } from '../licenses.js';
import { isSameTag, type TagRef } from '../tagRefs.js';
import {
  type GalleryColorizeBy,
  type GalleryFilter,
  galleryAddTag,
  galleryColorizeBy,
  galleryFilterTagResolved,
  galleryQuickAddTag,
  gallerySetFilter,
  gallerySetLicense,
  galleryToggleDirection,
  galleryToggleLegend,
  galleryTogglePremium,
} from './actions.js';

// Persisted gallery preferences, the filter among them; never reset by a map
// clear.
export interface GallerySettingsState {
  colorizeBy: GalleryColorizeBy | null;
  recentTags: TagRef[];
  showDirection: boolean;
  showLegend: boolean;
  // Default premium flag for newly added upload items; mirrors the user's last
  // premium toggle in the upload modal.
  premium: boolean;
  // Default license for newly added upload items; mirrors the user's last
  // license choice in the upload modal.
  license: GalleryLicense;
  /** Remembered also while the photos layer is off; then not in the URL. */
  filter: GalleryFilter;
}

export const gallerySettingsInitialState: GallerySettingsState = {
  colorizeBy: null,
  recentTags: [],
  showDirection: true,
  showLegend: true,
  premium: true,
  license: DEFAULT_PHOTO_LICENSE,
  filter: {},
};

export const gallerySettingsReducer = createReducer(
  gallerySettingsInitialState,
  (builder) =>
    builder
      .addCase(galleryColorizeBy, (state, action) => {
        state.colorizeBy = action.payload;
      })
      .addCase(galleryToggleDirection, (state, action) => {
        state.showDirection = action.payload ?? !state.showDirection;
      })
      .addCase(galleryToggleLegend, (state, action) => {
        state.showLegend = action.payload ?? !state.showLegend;
      })
      .addCase(galleryTogglePremium, (state, action) => {
        state.premium = action.payload;
      })
      .addCase(gallerySetLicense, (state, action) => {
        state.license = action.payload;
      })
      .addCase(gallerySetFilter, (state, action) => {
        state.filter = action.payload;
      })
      .addCase(galleryFilterTagResolved, (state, action) => {
        state.filter = {
          ...state.filter,
          tag: undefined,
          tagId: action.payload,
        };
      })
      .addCase(mapsLoaded, (state, action) => {
        // A map without one keeps the remembered filter.
        const filter = mapGalleryFilter(action.payload.data);

        if (filter) {
          state.filter = filter;
        }
      })
      .addMatcher(
        isAnyOf(galleryAddTag, galleryQuickAddTag),
        (state, { payload }) => {
          const i = state.recentTags.findIndex((tag) =>
            isSameTag(tag, payload),
          );

          if (i > -1) {
            state.recentTags.splice(i, 1);
          }

          state.recentTags.unshift(payload);

          state.recentTags.splice(8);
        },
      ),
);
