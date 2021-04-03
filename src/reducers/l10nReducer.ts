import { RootAction } from 'fm3/actions';
import { authSetUser } from 'fm3/actions/authActions';
import {
  l10nSetChosenLanguage,
  l10nSetLanguage,
} from 'fm3/actions/l10nActions';
import { createReducer } from 'typesafe-actions';

export interface L10nState {
  chosenLanguage: string | null;
  language: string;
  counter: number;
}

export const l10nInitialState: L10nState = {
  chosenLanguage: null,
  language: 'en',
  counter: 0,
};

export const l10nReducer = createReducer<L10nState, RootAction>(
  l10nInitialState,
)
  .handleAction(authSetUser, (state, action) => ({
    ...state,
    chosenLanguage: action.payload?.language ?? state.chosenLanguage,
  }))
  .handleAction(l10nSetChosenLanguage, (state, action) => ({
    ...state,
    chosenLanguage: action.payload,
  }))
  .handleAction(l10nSetLanguage, (state, action) => ({
    ...state,
    language: action.payload,
    counter: state.counter + 1,
  }));
