import { applyCookieConsent } from 'fm3/actions/mainActions';
import { Processor } from 'fm3/middlewares/processorMiddleware';

export const cookieConsentProcessor: Processor = {
  actionCreator: applyCookieConsent,
  statePredicate: (state) => !!state.main.cookieConsentResult,
  async handle() {
    window._paq.push(['setCookieConsentGiven']);

    window.fbq('consent', 'grant');
  },
};
