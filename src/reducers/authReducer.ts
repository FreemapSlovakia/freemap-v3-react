import { RootAction } from 'fm3/actions';
import {
  authChooseLoginMethod,
  authLoginClose,
  authLoginWithFacebook,
  authLoginWithGoogle,
  authLoginWithOsm,
  authLogout,
  authSetUser,
} from 'fm3/actions/authActions';
import { User } from 'fm3/types/common';
import { createReducer } from 'typesafe-actions';

export interface AuthState {
  chooseLoginMethod: boolean;
  validated: boolean;
  user: User | null;
}

export const authInitialState: AuthState = {
  chooseLoginMethod: false,
  validated: false,
  user: null,
};

export const authReducer = createReducer<AuthState, RootAction>(
  authInitialState,
)
  .handleAction(authSetUser, (state, action) => ({
    ...state,
    user: action.payload && {
      name: action.payload.name,
      email: action.payload.email,
      sendGalleryEmails: action.payload.sendGalleryEmails,
      id: action.payload.id,
      authToken: action.payload.authToken,
      isAdmin: action.payload.isAdmin,
    },
    validated: true,
  }))
  .handleAction(authLogout, () => authInitialState)
  .handleAction(authChooseLoginMethod, (state) => ({
    ...state,
    chooseLoginMethod: true,
  }))
  .handleAction(authLoginClose, (state) => ({
    ...state,
    chooseLoginMethod: false,
  }))
  .handleAction(authLoginWithFacebook, (state) => ({
    ...state,
    chooseLoginMethod: false,
  }))
  .handleAction(authLoginWithGoogle, (state) => ({
    ...state,
    chooseLoginMethod: false,
  }))
  .handleAction(authLoginWithOsm, (state) => ({
    ...state,
    chooseLoginMethod: false,
  }));
