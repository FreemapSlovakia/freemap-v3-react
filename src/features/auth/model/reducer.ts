import { setActiveModal } from '@app/store/actions.js';
import { createReducer } from '@reduxjs/toolkit';
import {
  authFetchPurchases,
  authLogout,
  authSetPurchases,
  authSetUser,
} from './actions.js';
import { purchaseOnLogin } from './purchaseActions.js';
import type { Purchase, PurchaseRecord, User } from './types.js';

export interface AuthState {
  validated: boolean;
  user: User | null;
  purchases: PurchaseRecord[] | null;
  purchaseOnLogin: Purchase | undefined;
}

export const authInitialState: AuthState = {
  validated: false,
  user: null,
  purchases: null,
  purchaseOnLogin: undefined,
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
        credits: action.payload.credits,
      },
      purchases: action.payload ? state.purchases : null,
      validated: true,
    }))
    .addCase(authLogout, () => authInitialState)
    .addCase(authFetchPurchases, (state) => {
      state.purchases = null;
    })
    .addCase(authSetPurchases, (state, action) => {
      state.purchases = action.payload;
    })
    .addCase(purchaseOnLogin, (state, action) => {
      state.purchaseOnLogin = action.payload;
    })
    .addCase(setActiveModal, (state, action) => {
      if (!action.payload) {
        state.purchaseOnLogin = undefined;
      }
    }),
);
