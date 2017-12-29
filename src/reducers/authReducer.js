import * as at from 'fm3/actionTypes';

const initialState = {
  chooseLoginMethod: false,
  user: null,
};

export default function infoPoint(state = initialState, action) {
  switch (action.type) {
    case at.AUTH_SET_USER:
      return {
        ...state,
        user: action.payload && {
          name: action.payload.name,
          email: action.payload.email,
          id: action.payload.id,
          authToken: action.payload.authToken,
          isAdmin: action.payload.isAdmin,
        },
      };
    case at.AUTH_LOGOUT:
      return { ...state, user: null };
    case at.AUTH_CHOOSE_LOGIN_METHOD:
      return { ...state, chooseLoginMethod: true };
    case at.AUTH_LOGIN_CLOSE:
    case at.AUTH_LOGIN_WITH_FACEBOOK:
    case at.AUTH_LOGIN_WITH_GOOGLE:
    case at.AUTH_LOGIN_WITH_OSM:
      return { ...state, chooseLoginMethod: false };
    default:
      return state;
  }
}
