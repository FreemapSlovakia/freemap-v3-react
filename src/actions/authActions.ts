import { createAction } from 'typesafe-actions';

export const authCheckLogin = createAction('AUTH_CHECK_LOGIN')<>();

export const authLoginWithOsm = createAction('AUTH_LOGIN_WITH_OSM');

export const authLoginWithFacebook = createAction('AUTH_LOGIN_WITH_FACEBOOK');

export const authLoginWithGoogle = createAction('AUTH_LOGIN_WITH_GOOGLE');

export const authLoginClose = createAction('AUTH_LOGIN_CLOSE');

export const authLogout = createAction('AUTH_LOGOUT');

export const authStartLogout = createAction('AUTH_START_LOGOUT');

export const authSetUser = createStandardAction('AUTH_SET_USER')<any>();

export const authChooseLoginMethod = createAction('AUTH_CHOOSE_LOGIN_METHOD');
