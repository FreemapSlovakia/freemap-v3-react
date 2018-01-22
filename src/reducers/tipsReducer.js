import tips from 'fm3/tips/index.json';
import * as at from 'fm3/actionTypes';

const initialState = {
  tip: null,
  preventTips: false,
};

export default function reduceTips(state = initialState, action) {
  switch (action.type) {
    case at.TIPS_SHOW:
      return { ...state, tip: action.payload };
    case at.TIPS_NEXT:
      return { ...state, tip: tips[(ft(action.payload === null ? 'freemap' : action.payload || state.tip) + 1) % tips.length][0] };
    case at.TIPS_PREVIOUS:
      return { ...state, tip: tips[(ft(state.tip) + tips.length - 1) % tips.length][0] };
    case at.TIPS_PREVENT_NEXT_TIME:
      return { ...state, preventTips: action.payload };
    case at.AUTH_SET_USER: {
      const user = action.payload;
      return user ? {
        ...state,
        preventTips: user.preventTips === undefined ? state.preventTips : user.preventTips,
      } : state;
    }
    default:
      return state;
  }
}

function ft(tip) {
  return tips.findIndex(([key]) => key === tip);
}
