import { createReducer } from '@reduxjs/toolkit';
import {
  authLogout,
  authSetPremium,
  authSetUser,
} from 'fm3/actions/authActions';
import { User } from 'fm3/types/common';

export interface AuthState {
  validated: boolean;
  user: User | null;
}

export const authInitialState: AuthState = {
  validated: false,
  user: null,
};

export const authReducer = createReducer(authInitialState, (builder) =>
  builder
    .addCase(authSetUser, (state, action) => ({
      ...state,
      user: action.payload && {
        name: action.payload.name,
        email: action.payload.email,
        sendGalleryEmails: action.payload.sendGalleryEmails,
        id: action.payload.id,
        authToken: action.payload.authToken,
        isAdmin: action.payload.isAdmin,
        isPremium: action.payload.isPremium,
        authProviders: action.payload.authProviders,
      },
      validated: true,
    }))
    .addCase(authSetPremium, (state) => ({
      ...state,
      user: state.user && { ...state.user, isPremium: true },
    }))
    .addCase(authLogout, () => authInitialState),
);
