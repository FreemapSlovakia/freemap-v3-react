import * as at from 'fm3/actionTypes';

const initialState = {
  chosenLanguage: null,
  language: 'en-US', // TODO this is hack so that setLanguage will change it in any case on load (eg. to 'en')
};

export default function l10n(state = initialState, action) {
  switch (action.type) {
    case at.L10N_SET_CHOSEN_LANGUAGE:
      return { ...state, chosenLanguage: action.payload };
    case at.L10N_SET_LANGUAGE:
      return { ...state, language: action.payload };
    default:
      return state;
  }
}
