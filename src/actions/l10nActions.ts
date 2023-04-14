import { createAction } from 'typesafe-actions';

export const l10nSetChosenLanguage = createAction('L10N_SET_CHOSEN_LANGUAGE')<{
  language: string | null;
  noSave?: boolean;
}>();

export const l10nSetLanguage = createAction('L10N_SET_LANGUAGE')<string>();
