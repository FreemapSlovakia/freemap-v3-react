import { AuthProvider, User } from 'fm3/types/common';
import { createAction } from 'typesafe-actions';

export const authWithOsm = createAction('AUTH_WITH_OSM')<{
  connect: boolean;
}>();

export const authWithOsm2 = createAction('AUTH_WITH_OSM_2')<{
  connect: boolean;
  code: string;
}>();

export const authWithFacebook = createAction('AUTH_WITH_FACEBOOK')<{
  connect: boolean;
}>();

export const authWithGoogle = createAction('AUTH_WITH_GOOGLE')<{
  connect: boolean;
}>();

export const authWithGarmin = createAction('AUTH_WITH_GARMIN')<{
  connect: boolean;
}>();

export const authWithGarmin2 = createAction('AUTH_WITH_GARMIN_2')<{
  connect: boolean;
  token: string;
  verifier: string;
}>();

export const authDisconnect = createAction('AUTH_DISCONNECT')<{
  provider: AuthProvider;
}>();

export const authLogout = createAction('AUTH_LOGOUT')();

export const authStartLogout = createAction('AUTH_START_LOGOUT')();

export const authSetUser = createAction('AUTH_SET_USER')<User | null>();

export const authInit = createAction('AUTH_INIT')();

export const authSetPremium = createAction('AUTH_SET_PREMIUM')();

export const authDeleteAccount = createAction('AUTH_DELETE_ACCOUNT')();
