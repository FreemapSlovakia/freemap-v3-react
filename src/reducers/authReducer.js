const initialState = {
  chooseLoginMethod: false,
  user: null,
};

export default function infoPoint(state = initialState, action) {
  switch (action.type) {
    case 'AUTH_SET_USER':
      return { ...state, user: action.payload };
    case 'AUTH_LOGOUT':
      return { ...state, user: null };
    case 'AUTH_CHOOSE_LOGIN_METHOD':
      return { ...state, chooseLoginMethod: true };
    case 'AUTH_LOGIN_CLOSE':
    case 'AUTH_LOGIN_WITH_FACEBOOK':
    case 'AUTH_LOGIN_WITH_GOOGLE':
    case 'AUTH_LOGIN_WITH_OSM':
      return { ...state, chooseLoginMethod: false };
    default:
      return state;
  }
}
