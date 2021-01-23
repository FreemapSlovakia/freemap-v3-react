import { RootAction } from 'fm3/actions';
import {
  Changeset,
  changesetsSet,
  changesetsSetAuthorName,
  changesetsSetDays,
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
  .handleAction([clearMap, setTool], () => initialState)
  .handleAction(changesetsSet, (state, action) => ({
    ...state,
    changesets: action.payload,
  }))
  .handleAction(changesetsSetDays, (state, action) => ({
    ...state,
    days: action.payload,
  }))
  .handleAction(changesetsSetAuthorName, (state, action) => ({
    ...state,
    authorName: action.payload,
  }));
