import { setActiveModal } from '@app/store/actions.js';
import { createReducer } from '@reduxjs/toolkit';
import type { MapBody } from '@shared/mapDefinitions.js';
import { bundledBodies } from '@shared/mapLibrary/mapIndex.js';
import {
  mapLibraryBodiesLoaded,
  mapLibraryPreviewEnd,
  mapLibraryPreviewStart,
} from './actions.js';

export interface MapLibraryState {
  /** The loaded bodies of library maps, by id; see `mapLibraryLoadProcessor`. */
  bodies: Record<string, MapBody>;
  /** The map shown while the library steps aside, and the layers it replaced. */
  preview: { type: string; restore: string[] } | null;
}

export const mapLibraryInitialState: MapLibraryState = {
  bodies: { ...bundledBodies },
  preview: null,
};

export const mapLibraryReducer = createReducer(
  mapLibraryInitialState,
  (builder) => {
    builder
      .addCase(mapLibraryBodiesLoaded, (state, { payload }) => {
        Object.assign(state.bodies, payload);
      })
      .addCase(mapLibraryPreviewStart, (state, { payload }) => {
        state.preview = { type: payload.type, restore: payload.restore ?? [] };
      })
      .addCase(mapLibraryPreviewEnd, (state) => {
        state.preview = null;
      })
      // The library is gone from under it; see `mapLibraryPreviewModalProcessor`.
      .addCase(setActiveModal, (state) => {
        state.preview = null;
      });
  },
);
