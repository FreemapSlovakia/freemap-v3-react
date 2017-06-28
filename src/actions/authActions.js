export function checkLogin() {
  return { type: 'CHECK_LOGIN' };
}

export function authLogin() {
  return { type: 'AUTH_LOGIN' };
}

export function authLogout() {
  return { type: 'AUTH_LOGOUT' };
}

export function authSetUser(user) {
  return { type: 'AUTH_SET_USER', payload: user };
}
