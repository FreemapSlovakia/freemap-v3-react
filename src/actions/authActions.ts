import { createAction } from '@reduxjs/toolkit';
import type { Action } from 'redux';
import type { AuthProvider, Purchase, User } from '../types/auth.js';

export const authWithOsm = createAction<{
  connect: boolean;
}>('AUTH_WITH_OSM');

export const authWithOsm2 = createAction<{
  connect: boolean;
  code: string;
}>('AUTH_WITH_OSM_2');

export const authWithFacebook = createAction<{
  connect: boolean;
}>('AUTH_WITH_FACEBOOK');

export const authWithGoogle = createAction<{
  connect: boolean;
}>('AUTH_WITH_GOOGLE');

export const authWithGarmin = createAction<{
  connect: boolean;
  successAction?: Action;
}>('AUTH_WITH_GARMIN');

export const authWithGarmin2 = createAction<{
  // connect: boolean;
  token: string;
  verifier: string;
  // successAction?: Action;
}>('AUTH_WITH_GARMIN_2');

export const authDisconnect = createAction<{
  provider: AuthProvider;
}>('AUTH_DISCONNECT');

export const authLogout = createAction('AUTH_LOGOUT');

export const authStartLogout = createAction('AUTH_START_LOGOUT');

export const authSetUser = createAction<User | null>('AUTH_SET_USER');

export const authInit = createAction<{ becamePremium?: boolean }>('AUTH_INIT');

export const authDeleteAccount = createAction('AUTH_DELETE_ACCOUNT');

export const authFetchPurchases = createAction('AUTH_FETCH_PURCHASES');

export const authSetPurchases = createAction<Purchase[] | null>(
  'AUTH_SET_PURCHASES',
);
