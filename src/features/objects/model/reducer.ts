import { clearMapFeatures } from '@app/store/actions.js';
import { mapsLoaded } from '@features/myMaps/model/actions.js';
import { upgradeObjectFilter } from '@osm/taxon.js';
import { createReducer } from '@reduxjs/toolkit';
import {
  type ObjectsResult,
  objectsSetDetailsOverride,
  objectsSetFilter,
  objectsSetResult,
} from './actions.js';

export interface ObjectsState {
  objects: ObjectsResult[];
  active: string[];
  /** See {@link objectsSetDetailsOverride}; transient by design. */
  detailsOverride: boolean | null;
}

export const objectInitialState: ObjectsState = {
  objects: [],
  active: [],
  detailsOverride: null,
};

export const objectsReducer = createReducer(objectInitialState, (builder) =>
  builder
    .addCase(clearMapFeatures, () => objectInitialState)
    .addCase(objectsSetFilter, (state, action) => {
      state.active = [...new Set(action.payload.map(upgradeObjectFilter))];
    })
    .addCase(objectsSetResult, (state, action) => {
      state.objects = action.payload;
    })
    .addCase(objectsSetDetailsOverride, (state, action) => {
      state.detailsOverride = action.payload;
    })
    .addCase(mapsLoaded, (state, { payload: { merge, data } }) => {
      const loaded = (data.objectsV2?.active ?? []).map(upgradeObjectFilter);

      state.active = !merge
        ? [...new Set(loaded)]
        : data.objectsV2
          ? [...new Set([...state.active, ...loaded])]
          : state.active;
    }),
);
