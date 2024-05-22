import { RootAction } from 'fm3/actions';
import { clearMapFeatures } from 'fm3/actions/mainActions';
import { mapsLoaded } from 'fm3/actions/mapsActions';
import {
  MarkerType,
  ObjectsResult,
  objectsSetFilter,
  objectsSetResult,
} from 'fm3/actions/objectsActions';
import { createReducer } from 'typesafe-actions';
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

export const objectsReducer = createReducer<ObjectsState, RootAction>(
  objectInitialState,
)
  .handleAction(clearMapFeatures, () => objectInitialState)
  .handleAction(objectsSetFilter, (state, action) => ({
    ...state,
    active: action.payload,
  }))
  .handleAction(objectsSetResult, (state, action) => {
    return {
      ...state,
      objects: action.payload,
    };
  })
  .handleAction(mapsLoaded, (state, { payload: { merge, data } }) => {
    return {
      ...state,
      active: !merge
        ? data.objectsV2?.active ?? []
        : data.objectsV2
          ? [...new Set([...state.active, ...data.objectsV2?.active])]
          : state.active,
    };
  })
  .handleAction(setSelectedIcon, (state, action) => ({
    ...state,
    selectedIcon: action.payload,
  }));
