import { toastsAdd } from '../toasts/model/actions.js';
import { applyCookieConsent } from './model/actions.js';

export function createCookieConsentToastAction() {
  return toastsAdd({
    id: 'cookieConsent',
    messageKey: 'main.cookieConsent',
    style: 'warning',
    actions: [
      {
        nameKey: 'general.accept',
        action: applyCookieConsent(),
        style: 'secondary',
      },
    ],
  });
}
