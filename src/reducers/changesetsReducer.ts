import { createReducer } from 'typesafe-actions';
import { RootAction } from 'fm3/actions';
import { clearMap } from 'fm3/actions/mainActions';
import {
  changesetsSetDays,
  changesetsSetAuthorName,
  changesetsSet,
  Changeset,
} from 'fm3/actions/changesetsActions';

export interface ChangesetsState {
  changesets: Changeset[];
  days: number | null;
  authorName: string | null;
}

const initialState: ChangesetsState = {
  changesets: [],
  days: null,
  authorName: null,
};

export const changesetReducer = createReducer<ChangesetsState, RootAction>(
  initialState,
)
  .handleAction(clearMap, () => initialState)
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
