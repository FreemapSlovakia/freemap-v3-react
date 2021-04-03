import { RootAction } from 'fm3/actions';
import { authSetUser } from 'fm3/actions/authActions';
import { getTip, tipsPreventNextTime, tipsShow } from 'fm3/actions/tipsActions';
import { TipKey } from 'fm3/tips';
import { createReducer } from 'typesafe-actions';

export interface TipsState {
  tip: TipKey | null;
  lastTip: TipKey | null;
  preventTips: boolean;
}

export const tipsInitialState: TipsState = {
  tip: null,
  lastTip: null,
  preventTips: false,
};

export const tipsReducer = createReducer<TipsState, RootAction>(
  tipsInitialState,
)
  .handleAction(tipsShow, (state, action) => {
    const next = {
      ...state,
      tip: action.payload === null ? null : getTip(state.tip, action.payload),
    };

    if (next.tip) {
      next.lastTip = next.tip;
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
