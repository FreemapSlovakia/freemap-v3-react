import { createAction } from '@reduxjs/toolkit';
import type { Language } from '@shared/langUtils.js';

export const l10nSetChosenLanguage = createAction<{
  language: string | null;
  noSave?: boolean;
}>('L10N_SET_CHOSEN_LANGUAGE');

export const l10nSetLanguage = createAction<Language>('L10N_SET_LANGUAGE');
