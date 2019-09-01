import { createAction, createStandardAction } from 'typesafe-actions';
import { IUser } from 'fm3/types/common';

export const authCheckLogin = createAction('AUTH_CHECK_LOGIN');

export const authLoginWithOsm = createAction('AUTH_LOGIN_WITH_OSM');

export const authLoginWithOsm2 = createStandardAction('AUTH_LOGIN_WITH_OSM2')<{
  token: string;
  verifier: string;
}>();

export const authLoginWithFacebook = createAction('AUTH_LOGIN_WITH_FACEBOOK');

export const authLoginWithGoogle = createAction('AUTH_LOGIN_WITH_GOOGLE');

export const authLoginClose = createAction('AUTH_LOGIN_CLOSE');

export const authLogout = createAction('AUTH_LOGOUT');

export const authStartLogout = createAction('AUTH_START_LOGOUT');

export const authSetUser = createStandardAction('AUTH_SET_USER')<IUser>();

export const authChooseLoginMethod = createAction('AUTH_CHOOSE_LOGIN_METHOD');

export const authInit = createAction('AUTH_VERIFY_USER');
