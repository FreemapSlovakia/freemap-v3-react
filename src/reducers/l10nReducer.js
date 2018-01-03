import * as at from 'fm3/actionTypes';

const initialState = {
  translations: {},
  chosenLanguage: null,
  language: 'en',
};

export default function l10n(state = initialState, action) {
  switch (action.type) {
    case at.L10N_SET_LANGUAGE:
      return { ...state, chosenLanguage: action.payload };
    case at.L10N_SET_TRANSLATIONS:
      return { ...state, translations: action.payload.translations, language: action.payload.language };
    default:
      return state;
  }
}
