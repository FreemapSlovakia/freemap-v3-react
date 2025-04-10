import { applyCookieConsent } from '../actions/mainActions.js';
import { Processor } from '../middlewares/processorMiddleware.js';

export const cookieConsentProcessor: Processor = {
  actionCreator: applyCookieConsent,
  statePredicate: (state) => !!state.main.cookieConsentResult,
  async handle() {
    window._paq.push(['setCookieConsentGiven']);

    window.fbq('consent', 'grant');
  },
};
