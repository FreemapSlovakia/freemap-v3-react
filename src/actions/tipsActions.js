export function tipsNext(after) {
  return { type: 'TIPS_NEXT', payload: after };
}

export function tipsPrevious() {
  return { type: 'TIPS_PREVIOUS' };
}

export function tipsPreventNextTime(prevent) {
  return { type: 'TIPS_PREVENT_NEXT_TIME', payload: prevent };
}
