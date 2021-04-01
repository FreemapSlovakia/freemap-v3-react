import { RootAction } from 'fm3/actions';
import { authSetUser } from 'fm3/actions/authActions';
import { tipsPreventNextTime, tipsShow } from 'fm3/actions/tipsActions';
import { TipKey, tips } from 'fm3/tips';
import { createReducer } from 'typesafe-actions';

export interface TipsState {
  tip: TipKey | null;
  preventTips: boolean;
}

const initialState: TipsState = {
  tip: null,
  preventTips: false,
};

export const tipsReducer = createReducer<TipsState, RootAction>(initialState)
  .handleAction(tipsShow, (state, action) => {
    const next = {
      ...state,
      tip:
        action.payload === null
          ? null
          : action.payload === 'next'
          ? tips[(ft(state.tip) + 1) % tips.length][0]
          : action.payload === 'prev'
          ? tips[(ft(state.tip) + tips.length - 1) % tips.length][0]
          : action.payload,
    };

    if (next.tip === 'privacyPolicy') {
      if (action.payload === 'next') {
        next.tip = tips[(ft(next.tip) + 1) % tips.length][0];
      } else if (action.payload === 'prev') {
        next.tip = tips[(ft(next.tip) + tips.length - 1) % tips.length][0];
      }
    }

    return next;
  })
  .handleAction(tipsPreventNextTime, (state, action) => ({
    ...state,
    preventTips: action.payload.value,
  }))
  .handleAction(authSetUser, (state, action) => {
    const user = action.payload;
    return user
      ? {
          ...state,
          preventTips:
            user.preventTips === undefined
              ? state.preventTips
              : user.preventTips,
        }
      : state;
  });

function ft(tip: string | null) {
  return tips.findIndex(([key]) => key === tip);
}
