import { createAction } from '@reduxjs/toolkit';

export const l10nSetChosenLanguage = createAction<{
  language: string | null;
  noSave?: boolean;
}>('L10N_SET_CHOSEN_LANGUAGE');

export const l10nSetLanguage = createAction<string>('L10N_SET_LANGUAGE');
