import { applyCookieConsent } from './actions.js';
import type { Processor } from '../../../middlewares/processorMiddleware.js';

export const cookieConsentProcessor: Processor = {
  actionCreator: applyCookieConsent,
  statePredicate: (state) => !!state.cookieConsent.cookieConsentResult,
  async handle() {
    window._paq.push(['setCookieConsentGiven']);

    window.fbq('consent', 'grant');
  },
};
