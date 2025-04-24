import { createReducer } from '@reduxjs/toolkit';
import { clearMapFeatures } from '../actions/mainActions.js';
import { mapsLoaded } from '../actions/mapsActions.js';
import {
  MarkerType,
  ObjectsResult,
  objectsSetFilter,
  objectsSetResult,
  setSelectedIcon,
} from '../actions/objectsActions.js';

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
