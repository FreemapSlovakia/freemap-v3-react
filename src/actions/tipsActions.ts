import { createStandardAction, createAction } from 'typesafe-actions';

export const tipsShow = createStandardAction('TIPS_SHOW')<string>();

export const tipsNext = createStandardAction('TIPS_NEXT')<
  string | null | undefined
>();

export const tipsPrevious = createAction('TIPS_PREVIOUS');

export const tipsPreventNextTime = createStandardAction(
  'TIPS_PREVENT_NEXT_TIME',
)<boolean>();
