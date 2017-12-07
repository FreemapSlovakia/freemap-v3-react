export function authCheckLogin() {
  return { type: 'AUTH_CHECK_LOGIN' };
}

export function authLoginWithOsm() {
  return { type: 'AUTH_LOGIN_WITH_OSM' };
}

export function authLoginWithFacebook() {
  return { type: 'AUTH_LOGIN_WITH_FACEBOOK' };
}

export function authLoginWithGoogle() {
  return { type: 'AUTH_LOGIN_WITH_GOOGLE' };
}

export function authLoginClose() {
  return { type: 'AUTH_LOGIN_CLOSE' };
}

export function authLogout() {
  return { type: 'AUTH_LOGOUT' };
}

export function authStartLogout() {
  return { type: 'AUTH_START_LOGOUT' };
}

export function authSetUser(user) {
  return { type: 'AUTH_SET_USER', payload: user };
}

export function authChooseLoginMethod() {
  return { type: 'AUTH_CHOOSE_LOGIN_METHOD' };
}
