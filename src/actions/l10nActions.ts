import { createStandardAction } from 'typesafe-actions';

export const l10nSetChosenLanguage = createStandardAction(
  'L10N_SET_CHOSEN_LANGUAGE',
)<string>();

export const l10nSetLanguage = createStandardAction('L10N_SET_LANGUAGE')<
  string
>();
