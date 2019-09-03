import { createReducer } from 'typesafe-actions';
import { RootAction } from 'fm3/actions';
import {
  l10nSetChosenLanguage,
  l10nSetLanguage,
} from 'fm3/actions/l10nActions';

export interface L10nState {
  chosenLanguage: string | null;
  language: string;
}

const initialState: L10nState = {
  chosenLanguage: null,
  language: 'en-US', // TODO this is hack so that setLanguage will change it in any case on load (eg. to 'en')
};

export const l10nReducer = createReducer<L10nState, RootAction>(initialState)
  .handleAction(l10nSetChosenLanguage, (state, action) => ({
    ...state,
    chosenLanguage: action.payload,
  }))
  .handleAction(l10nSetLanguage, (state, action) => ({
    ...state,
    language: action.payload,
  }));
