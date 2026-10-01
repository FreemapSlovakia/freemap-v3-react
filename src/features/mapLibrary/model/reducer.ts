import { createReducer } from '@reduxjs/toolkit';
import type { MapBody } from '@shared/mapDefinitions.js';
import { bundledBodies } from '@shared/mapLibrary/mapIndex.js';
import { mapLibraryBodiesLoaded } from './actions.js';

export interface MapLibraryState {
  /** The loaded bodies of library maps, by id; see `mapLibraryLoadProcessor`. */
  bodies: Record<string, MapBody>;
}

export const mapLibraryInitialState: MapLibraryState = {
  bodies: { ...bundledBodies },
};

export const mapLibraryReducer = createReducer(
  mapLibraryInitialState,
  (builder) => {
    builder.addCase(mapLibraryBodiesLoaded, (state, { payload }) => {
      Object.assign(state.bodies, payload);
    });
  },
);
