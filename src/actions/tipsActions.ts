import { createAction } from 'typesafe-actions';

export const tipsShow = createAction('TIPS_SHOW')<
  string | 'next' | 'prev' | null
>();

export const tipsPreventNextTime = createAction(
  'TIPS_PREVENT_NEXT_TIME',
)<boolean>();
