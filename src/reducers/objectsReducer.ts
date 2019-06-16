import * as at from 'fm3/actionTypes';
import { RootAction } from 'fm3/actions';
import { createReducer } from 'typesafe-actions';
import { clearMap } from 'fm3/actions/mainActions';
import { objectsSetResult, ObjectsResult } from 'fm3/actions/objectsActions';

export interface IObjectsState {
  objects: ObjectsResult[];
}

const initialState: IObjectsState = {
  objects: [],
};

export default createReducer<IObjectsState, RootAction>(initialState)
  .handleAction(clearMap, () => initialState)
  .handleAction(objectsSetResult, (state, action) => ({
    ...state,
    objects: [...state.objects, ...action.payload],
  }));
