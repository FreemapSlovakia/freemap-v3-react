import { User } from 'fm3/types/common';
import { createAction } from 'typesafe-actions';

export const authCheckLogin = createAction('AUTH_CHECK_LOGIN')();

export const authLoginWithOsm = createAction('AUTH_LOGIN_WITH_OSM')();

export const authLoginWithOsm2 = createAction('AUTH_LOGIN_WITH_OSM2')<{
  token: string;
  verifier: string;
}>();

export const authLoginWithFacebook = createAction('AUTH_LOGIN_WITH_FACEBOOK')();

export const authLoginWithGoogle = createAction('AUTH_LOGIN_WITH_GOOGLE')();

export const authLogout = createAction('AUTH_LOGOUT')();

export const authStartLogout = createAction('AUTH_START_LOGOUT')();

export const authSetUser = createAction('AUTH_SET_USER')<User | null>();

export const authInit = createAction('AUTH_INIT')();
