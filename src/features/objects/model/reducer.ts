import { clearMapFeatures } from '@app/store/actions.js';
import { mapsLoaded } from '@features/myMaps/model/actions.js';
import { createReducer } from '@reduxjs/toolkit';
import {
  MarkerType,
  ObjectsResult,
  objectsSetFilter,
  objectsSetResult,
  setSelectedIcon,
} from './actions.js';

export interface ObjectsState {
  objects: ObjectsResult[];
  active: string[];
  selectedIcon: MarkerType;
}

export const objectInitialState: ObjectsState = {
  objects: [],
  active: [],
  selectedIcon: 'pin',
};

export const objectsReducer = createReducer(objectInitialState, (builder) =>
  builder
    .addCase(clearMapFeatures, () => objectInitialState)
    .addCase(objectsSetFilter, (state, action) => {
      state.active = action.payload;
    })
    .addCase(objectsSetResult, (state, action) => {
      state.objects = action.payload;
    })
    .addCase(mapsLoaded, (state, { payload: { merge, data } }) => {
      state.active = !merge
        ? (data.objectsV2?.active ?? [])
        : data.objectsV2
          ? [...new Set([...state.active, ...(data.objectsV2?.active ?? {})])]
          : state.active;
    })
    .addCase(setSelectedIcon, (state, action) => {
      state.selectedIcon = action.payload;
    }),
);
