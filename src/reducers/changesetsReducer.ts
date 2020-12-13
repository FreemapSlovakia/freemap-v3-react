import { RootAction } from 'fm3/actions';
import {
  Changeset,
  changesetsSet,
  changesetsSetAuthorName,
  changesetsSetDays,
} from 'fm3/actions/changesetsActions';
import { clearMap, deleteFeature } from 'fm3/actions/mainActions';
import { createReducer } from 'typesafe-actions';

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
  }))
  .handleAction(deleteFeature, (state, action) =>
    action.payload.type === 'changesets' ? initialState : state,
  );
