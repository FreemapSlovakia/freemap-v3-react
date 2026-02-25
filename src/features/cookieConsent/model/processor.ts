import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { applyCookieConsent } from './actions.js';

export const cookieConsentProcessor: Processor = {
  actionCreator: applyCookieConsent,
  statePredicate: (state) => Boolean(state.cookieConsent.cookieConsentResult),
  async handle() {
    window._paq.push(['setCookieConsentGiven']);

    window.fbq('consent', 'grant');
  },
};
