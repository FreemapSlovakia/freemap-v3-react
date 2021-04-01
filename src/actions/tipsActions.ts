import { Tip } from 'fm3/tips';
import { createAction } from 'typesafe-actions';

export const tipsShow = createAction('TIPS_SHOW')<
  Tip | 'next' | 'prev' | null
>();

export const tipsPreventNextTime = createAction('TIPS_PREVENT_NEXT_TIME')<{
  value: boolean;
  save: boolean;
}>();
