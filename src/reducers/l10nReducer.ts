import { createReducer } from '@reduxjs/toolkit';
import { authSetUser } from '../actions/authActions.js';
import {
  l10nSetChosenLanguage,
  l10nSetLanguage,
} from '../actions/l10nActions.js';

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

export const l10nReducer = createReducer(l10nInitialState, (builder) =>
  builder
    .addCase(authSetUser, (state, action) => {
      state.chosenLanguage = action.payload?.language ?? state.chosenLanguage;
    })
    .addCase(l10nSetChosenLanguage, (state, action) => {
      state.chosenLanguage = action.payload.language;
    })
    .addCase(l10nSetLanguage, (state, action) => {
      state.language = action.payload;

      state.counter = state.counter + 1;
    }),
);
