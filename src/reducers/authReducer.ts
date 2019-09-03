import { User } from 'fm3/types/common';
import { RootAction } from 'fm3/actions';
import {
  authSetUser,
  authLogout,
  authChooseLoginMethod,
  authLoginWithFacebook,
  authLoginClose,
  authLoginWithGoogle,
  authLoginWithOsm,
} from 'fm3/actions/authActions';
import { createReducer } from 'typesafe-actions';

export interface AuthState {
  chooseLoginMethod: boolean;
  user: User | null;
}

const initialState = {
  chooseLoginMethod: false,
  user: null,
};

export const authReducer = createReducer<AuthState, RootAction>(initialState)
  .handleAction(authSetUser, (state, action) => ({
    ...state,
    user: action.payload && {
      name: action.payload.name,
      email: action.payload.email,
      id: action.payload.id,
      authToken: action.payload.authToken,
      isAdmin: action.payload.isAdmin,
    },
  }))
  .handleAction(authLogout, state => ({ ...state, user: null }))
  .handleAction(authChooseLoginMethod, state => ({
    ...state,
    chooseLoginMethod: true,
  }))
  .handleAction(authLoginClose, state => ({
    ...state,
    chooseLoginMethod: false,
  }))
  .handleAction(authLoginWithFacebook, state => ({
    ...state,
    chooseLoginMethod: false,
  }))
  .handleAction(authLoginWithGoogle, state => ({
    ...state,
    chooseLoginMethod: false,
  }))
  .handleAction(authLoginWithOsm, state => ({
    ...state,
    chooseLoginMethod: false,
  }));
