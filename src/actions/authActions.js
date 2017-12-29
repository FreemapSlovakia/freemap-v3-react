import * as at from 'fm3/actionTypes';

export function authCheckLogin() {
  return { type: at.AUTH_CHECK_LOGIN };
}

export function authLoginWithOsm() {
  return { type: at.AUTH_LOGIN_WITH_OSM };
}

export function authLoginWithFacebook() {
  return { type: at.AUTH_LOGIN_WITH_FACEBOOK };
}

export function authLoginWithGoogle() {
  return { type: at.AUTH_LOGIN_WITH_GOOGLE };
}

export function authLoginClose() {
  return { type: at.AUTH_LOGIN_CLOSE };
}

export function authLogout() {
  return { type: at.AUTH_LOGOUT };
}

export function authStartLogout() {
  return { type: at.AUTH_START_LOGOUT };
}

export function authSetUser(user) {
  return { type: at.AUTH_SET_USER, payload: user };
}

export function authChooseLoginMethod() {
  return { type: at.AUTH_CHOOSE_LOGIN_METHOD };
}
