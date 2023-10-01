import { User } from 'fm3/types/common';
import { createAction } from 'typesafe-actions';

export const authLoginWithOsm = createAction('AUTH_LOGIN_WITH_OSM')();

export const authLoginWithOsm2 = createAction('AUTH_LOGIN_WITH_OSM2')<string>();

export const authLoginWithFacebook = createAction('AUTH_LOGIN_WITH_FACEBOOK')();

export const authLoginWithGoogle = createAction('AUTH_LOGIN_WITH_GOOGLE')();

export const authLogout = createAction('AUTH_LOGOUT')();

export const authStartLogout = createAction('AUTH_START_LOGOUT')();

export const authSetUser = createAction('AUTH_SET_USER')<User | null>();

export const authInit = createAction('AUTH_INIT')();

export const authSetPremium = createAction('AUTH_SET_PREMIUM')();

export const authDeleteAccount = createAction('AUTH_DELETE_ACCOUNT')();
