import { createReducer } from '@reduxjs/toolkit';
import { clearMapFeatures } from 'fm3/actions/mainActions';
import { mapsLoaded } from 'fm3/actions/mapsActions';
import {
  MarkerType,
  ObjectsResult,
  objectsSetFilter,
  objectsSetResult,
} from 'fm3/actions/objectsActions';
import { setSelectedIcon } from 'fm3/actions/objectsActions';

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
    .addCase(objectsSetFilter, (state, action) => ({
      ...state,
      active: action.payload,
    }))
    .addCase(objectsSetResult, (state, action) => {
      return {
        ...state,
        objects: action.payload,
      };
    })
    .addCase(mapsLoaded, (state, { payload: { merge, data } }) => {
      return {
        ...state,
        active: !merge
          ? (data.objectsV2?.active ?? [])
          : data.objectsV2
            ? [...new Set([...state.active, ...(data.objectsV2?.active ?? {})])]
            : state.active,
      };
    })
    .addCase(setSelectedIcon, (state, action) => ({
      ...state,
      selectedIcon: action.payload,
    })),
);
