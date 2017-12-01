import tips from 'fm3/tips/index.json';

const initialState = {
  tip: 'attribution',
  preventTips: false,
};

export default function infoPoint(state = initialState, action) {
  switch (action.type) {
    case 'TIPS_SHOW':
      return { ...state, tip: action.payload };
    case 'TIPS_NEXT':
      return { ...state, tip: tips[(ft(action.payload === null ? 'attribution' : action.payload || state.tip) + 1) % tips.length][0] };
    case 'TIPS_PREVIOUS':
      return { ...state, tip: tips[(ft(state.tip) + tips.length - 1) % tips.length][0] };
    case 'TIPS_PREVENT_NEXT_TIME':
      return { ...state, preventTips: action.payload };
    case 'AUTH_SET_USER': {
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
