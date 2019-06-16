import tips from 'fm3/tips/index.json';
import { createReducer } from 'typesafe-actions';
import { RootAction } from 'fm3/actions';
import {
  tipsShow,
  tipsNext,
  tipsPrevious,
  tipsPreventNextTime,
} from 'fm3/actions/tipsActions';
import { authSetUser } from 'fm3/actions/authActions';

export interface ITipsState {
  tip: string | null;
  preventTips: boolean;
}

const initialState: ITipsState = {
  tip: null,
  preventTips: false,
};

export default createReducer<ITipsState, RootAction>(initialState)
  .handleAction(tipsShow, (state, action) => ({
    ...state,
    tip: action.payload,
  }))
  .handleAction(tipsNext, (state, action) => ({
    ...state,
    tip:
      tips[
        (ft(action.payload === null ? 'freemap' : action.payload || state.tip) +
          1) %
          tips.length
      ][0],
  }))
  .handleAction(tipsPrevious, state => ({
    ...state,
    tip: tips[(ft(state.tip) + tips.length - 1) % tips.length][0],
  }))
  .handleAction(tipsPreventNextTime, (state, action) => ({
    ...state,
    preventTips: action.payload,
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
