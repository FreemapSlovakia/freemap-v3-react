import { toastsAdd } from '../../toasts/model/actions.js';
import { applyCookieConsent } from './actions.js';

export const COOKIE_CONSENT_TOAST_ID = 'cookieConsent';

export function createCookieConsentToastAction() {
  return toastsAdd({
    id: COOKIE_CONSENT_TOAST_ID,
    messageKey: 'main.cookieConsent',
    style: 'warning',
    actions: [
      {
        nameKey: 'general.accept',
        action: applyCookieConsent(),
        variant: 'secondary',
      },
    ],
  });
}
