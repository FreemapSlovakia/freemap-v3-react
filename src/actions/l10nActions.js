import * as at from 'fm3/actionTypes';

export function l10nSetChosenLanguage(language) {
  return { type: at.L10N_SET_CHOSEN_LANGUAGE, payload: language };
}

export function l10nSetLanguage(language) {
  return { type: at.L10N_SET_LANGUAGE, payload: language };
}
