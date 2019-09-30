import { createStandardAction } from 'typesafe-actions';

export const tipsShow = createStandardAction('TIPS_SHOW')<
  string | 'next' | 'prev' | null
>();

export const tipsPreventNextTime = createStandardAction(
  'TIPS_PREVENT_NEXT_TIME',
)<boolean>();
