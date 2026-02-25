import { createAction } from '@reduxjs/toolkit';

export const applyCookieConsent = createAction('APPLY_COOKIE_CONSENT');

export const setAnalyticCookiesAllowed = createAction<boolean>(
  'SET_ANALYTICS_COOKIES_ALLOWED',
);
