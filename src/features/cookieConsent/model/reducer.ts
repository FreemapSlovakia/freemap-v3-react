import { createReducer } from '@reduxjs/toolkit';
import { applyCookieConsent, setAnalyticCookiesAllowed } from './actions.js';

export interface CookieConsentState {
  cookieConsentResult: boolean | null;
  analyticCookiesAllowed: boolean;
}

export const cookieConsentInitialState: CookieConsentState = {
  cookieConsentResult: null,
  analyticCookiesAllowed: true,
};

export const cookieConsentReducer = createReducer(
  cookieConsentInitialState,
  (builder) =>
    builder
      .addCase(applyCookieConsent, (state) => {
        state.cookieConsentResult = state.analyticCookiesAllowed;
      })
      .addCase(setAnalyticCookiesAllowed, (state, action) => {
        state.analyticCookiesAllowed = action.payload;
      }),
);
