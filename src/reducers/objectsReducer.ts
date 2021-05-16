import { RootAction } from 'fm3/actions';
import { clearMap } from 'fm3/actions/mainActions';
import { mapsDataLoaded } from 'fm3/actions/mapsActions';
import { ObjectsResult, objectsSetResult } from 'fm3/actions/objectsActions';
import { createReducer } from 'typesafe-actions';

export interface ObjectsState {
  objects: ObjectsResult[];
}

const initialState: ObjectsState = {
  objects: [],
};

export const objectsReducer = createReducer<ObjectsState, RootAction>(
  initialState,
)
  .handleAction(clearMap, () => initialState)
  .handleAction(objectsSetResult, (state, action) => {
    const newIds = new Set(action.payload.map((obj) => obj.id));
    return {
      ...state,
      objects: [
        ...state.objects.filter((obj) => !newIds.has(obj.id)),
        ...action.payload,
      ],
    };
  })
  .handleAction(mapsDataLoaded, (state, { payload }) => {
    return {
      ...state,
      objects: [
        ...(payload.merge ? state.objects : []),
        ...(payload.objects ?? initialState.objects),
      ],
    };
  });
