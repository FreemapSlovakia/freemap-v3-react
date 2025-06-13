import { createReducer } from '@reduxjs/toolkit';
import {
  authFetchPurchases,
  authLogout,
  authSetPurchases,
  authSetUser,
} from '../actions/authActions.js';
import type { Purchase, User } from '../types/auth.js';

export interface AuthState {
  validated: boolean;
  user: User | null;
  purchases: Purchase[] | null;
}

export const authInitialState: AuthState = {
  validated: false,
  user: null,
  purchases: null,
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
        premiumExpiration: action.payload.premiumExpiration,
        authProviders: action.payload.authProviders,
      },
      purchases: null,
      validated: true,
    }))
    .addCase(authLogout, () => authInitialState)
    .addCase(authFetchPurchases, (state) => {
      state.purchases = null;
    })
    .addCase(authSetPurchases, (state, action) => {
      state.purchases = action.payload;
    }),
);
