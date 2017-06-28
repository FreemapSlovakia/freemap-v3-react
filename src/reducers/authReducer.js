const initialState = {
  user: null,
};

export default function infoPoint(state = initialState, action) {
  switch (action.type) {
    case 'AUTH_SET_USER':
      return { ...state, user: action.payload };
    case 'AUTH_LOGOUT':
      return { ...state, user: null };
    default:
      return state;
  }
}
