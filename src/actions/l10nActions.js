import * as at from 'fm3/actionTypes';

export function l10nSetLanguage(language) {
  return { type: at.L10N_SET_LANGUAGE, payload: language };
}

export function l10nSetTranslations(language, translations) {
  return { type: at.L10N_SET_TRANSLATIONS, payload: { language, translations } };
}
