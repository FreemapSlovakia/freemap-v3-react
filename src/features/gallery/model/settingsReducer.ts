import { createReducer, isAnyOf } from '@reduxjs/toolkit';
import { DEFAULT_PHOTO_LICENSE, type GalleryLicense } from '../licenses.js';
import {
  type GalleryColorizeBy,
  galleryAddTag,
  galleryColorizeBy,
  galleryQuickAddTag,
  gallerySetLicense,
  galleryToggleDirection,
  galleryToggleLegend,
  galleryTogglePremium,
} from './actions.js';

// Persisted gallery display preferences. A dedicated settings slice (not the
// transient items/filter state), so the colorize mode, direction/legend
// toggles, recently-used tags, and per-upload premium default survive map
// clears without per-handler preservation.
export interface GallerySettingsState {
  colorizeBy: GalleryColorizeBy | null;
  recentTags: string[];
  showDirection: boolean;
  showLegend: boolean;
  // Default premium flag for newly added upload items; mirrors the user's last
  // premium toggle in the upload modal.
  premium: boolean;
  // Default license for newly added upload items; mirrors the user's last
  // license choice in the upload modal.
  license: GalleryLicense;
}

export const gallerySettingsInitialState: GallerySettingsState = {
  colorizeBy: null,
  recentTags: [],
  showDirection: true,
  showLegend: true,
  premium: true,
  license: DEFAULT_PHOTO_LICENSE,
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
