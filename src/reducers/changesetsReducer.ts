import { RootAction } from 'fm3/actions';
import {
  Changeset,
  changesetsSet,
  changesetsSetParams,
} from 'fm3/actions/changesetsActions';
import { clearMap, setTool } from 'fm3/actions/mainActions';
import { createReducer } from 'typesafe-actions';

export interface ChangesetsState {
  changesets: Changeset[];
  days: number | null;
  authorName: string | null;
}

export const initialState: ChangesetsState = {
  changesets: [],
  days: null,
  authorName: null,
};

export const changesetReducer = createReducer<ChangesetsState, RootAction>(
  initialState,
)
  .handleAction(clearMap, () => initialState)
  .handleAction(setTool, () => ({ ...initialState, days: 3 }))
  .handleAction(changesetsSet, (state, action) => ({
    ...state,
    changesets: action.payload,
  }))
  .handleAction(changesetsSetParams, (state, action) => ({
    ...state,
    ...action.payload,
  }));
