import * as at from 'fm3/actionTypes';

const initialState = {
  translations: {},
  lang: 'en',
};

export default function l10n(state = initialState, action) {
  switch (action.type) {
    case at.L10N_SET_LANGUAGE:
      return { ...state, language: action.payload };
    case at.L10N_SET_TRANSLATIONS:
      return { ...state, translations: action.payload };
    default:
      return state;
  }
}
