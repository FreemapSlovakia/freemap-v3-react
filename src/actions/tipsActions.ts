import { TipKey, tips } from 'fm3/tips';
import { createAction } from 'typesafe-actions';

export const tipsShow = createAction('TIPS_SHOW')<
  TipKey | 'next' | 'prev' | null
>();

export const tipsPreventNextTime = createAction('TIPS_PREVENT_NEXT_TIME')<{
  value: boolean;
  save: boolean;
}>();

// util fns

function ft(tip: string | null) {
  return tips.findIndex(([key]) => key === tip);
}

export function getTip(
  baseTipKey: TipKey | null,
  which: TipKey | 'next' | 'prev',
): TipKey | null {
  let t: TipKey;

  if (which === 'next') {
    t = tips[(ft(baseTipKey) + 1) % tips.length][0];
  } else if (which === 'prev') {
    t = tips[(ft(baseTipKey) + tips.length - 1) % tips.length][0];
  } else {
    return which;
  }

  if (t === 'privacyPolicy') {
    return getTip(t, which);
  }

  return t;
}
