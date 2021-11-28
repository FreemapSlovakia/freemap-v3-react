import { RootAction } from 'fm3/actions';
import { clearMap } from 'fm3/actions/mainActions';
import { mapsDataLoaded } from 'fm3/actions/mapsActions';
import {
  ObjectsResult,
  objectsSetFilter,
  objectsSetResult,
} from 'fm3/actions/objectsActions';
import { createReducer } from 'typesafe-actions';

export interface ObjectsState {
  objects: ObjectsResult[];
  active: string[];
}

const initialState: ObjectsState = {
  objects: [],
  active: [],
};

export const objectsReducer = createReducer<ObjectsState, RootAction>(
  initialState,
)
  .handleAction(clearMap, () => initialState)
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
  .handleAction(mapsDataLoaded, (state, { payload }) => {
    return {
      ...state,
      active: !payload.merge
        ? payload.objectsV2?.active ?? []
        : payload.objectsV2
        ? [...new Set([...state.active, ...payload.objectsV2?.active])]
        : state.active,
    };
  });
