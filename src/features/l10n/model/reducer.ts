import { authSetUser } from '@features/auth/model/actions.js';
import { createReducer } from '@reduxjs/toolkit';
import { isLanguage, type Language } from '@shared/langUtils.js';
import { l10nSetChosenLanguage, l10nSetLanguage } from './actions.js';

export interface L10nState {
  chosenLanguage: Language | null;
  language: Language;
}

export const l10nInitialState: L10nState = {
  chosenLanguage: null,
  language: 'en',
};

export const l10nReducer = createReducer(l10nInitialState, (builder) =>
  builder
    .addCase(authSetUser, (state, action) => {
      const language = action.payload?.language;

      state.chosenLanguage = isLanguage(language)
        ? language
        : state.chosenLanguage;
    })
    .addCase(l10nSetChosenLanguage, (state, action) => {
      const { language } = action.payload;

      state.chosenLanguage = isLanguage(language) ? language : null;
    })
    .addCase(l10nSetLanguage, (state, action) => {
      state.language = action.payload;
    }),
);
