import { RootAction } from 'fm3/actions';
import {
  Changeset,
  changesetsSet,
  changesetsSetParams,
} from 'fm3/actions/changesetsActions';
import { clearMapFeatures, setTool } from 'fm3/actions/mainActions';
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
  .handleAction(clearMapFeatures, () => initialState)
  .handleAction(setTool, (_state, action) => ({
    ...initialState,
    days: action.payload === 'changesets' ? 3 : null,
  }))
  .handleAction(changesetsSet, (state, action) => ({
    ...state,
    changesets: action.payload,
  }))
  .handleAction(changesetsSetParams, (state, action) => ({
    ...state,
    ...action.payload,
  }));
