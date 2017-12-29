import * as at from 'fm3/actionTypes';

export function tipsShow(which) {
  return { type: at.TIPS_SHOW, payload: which };
}

export function tipsNext(after) {
  return { type: at.TIPS_NEXT, payload: after };
}

export function tipsPrevious() {
  return { type: at.TIPS_PREVIOUS };
}

export function tipsPreventNextTime(prevent) {
  return { type: at.TIPS_PREVENT_NEXT_TIME, payload: prevent };
}
