import { setActiveModal } from '@app/store/actions.js';
import { createReducer } from '@reduxjs/toolkit';
import { authLogout, authSetUser } from './actions.js';
import { purchaseOnLogin } from './purchaseActions.js';
import type { Purchase, User } from './types.js';

export interface AuthState {
  validated: boolean;
  user: User | null;
  purchaseOnLogin: Purchase | undefined;
}

export const authInitialState: AuthState = {
  validated: false,
  user: null,
  purchaseOnLogin: undefined,
};

export const authReducer = createReducer(authInitialState, (builder) =>
  builder
    .addCase(authSetUser, (state, action) => ({
      ...state,
      user: action.payload && {
        name: action.payload.name,
        email: action.payload.email,
        description: action.payload.description,
        sendGalleryEmails: action.payload.sendGalleryEmails,
        id: action.payload.id,
        authToken: action.payload.authToken,
        isAdmin: action.payload.isAdmin,
        premiumExpiration: action.payload.premiumExpiration,
        authProviders: action.payload.authProviders,
        credits: action.payload.credits,
        coordinates: action.payload.coordinates,
      },
      validated: true,
    }))
    .addCase(authLogout, () => authInitialState)
    .addCase(purchaseOnLogin, (state, action) => {
      state.purchaseOnLogin = action.payload;
    })
    .addCase(setActiveModal, (state, action) => {
      if (!action.payload) {
        state.purchaseOnLogin = undefined;
      }
    }),
);
