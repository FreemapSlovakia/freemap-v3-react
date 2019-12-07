import { RootAction } from 'fm3/actions';
import { createReducer } from 'typesafe-actions';
import { clearMap, deleteFeature } from 'fm3/actions/mainActions';
import { objectsSetResult, ObjectsResult } from 'fm3/actions/objectsActions';

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
  .handleAction(objectsSetResult, (state, action) => ({
    ...state,
    objects: [...state.objects, ...action.payload],
  }))
  .handleAction(deleteFeature, (state, action) =>
    action?.meta?.selection?.type === 'objects'
      ? {
          ...state,
          objects: state.objects.filter(
            object => object.id !== action.meta.selection.id,
          ),
        }
      : state,
  );
