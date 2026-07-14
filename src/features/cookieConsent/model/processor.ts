import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import { applyCookieConsent } from './actions.js';

export const cookieConsentProcessor: Processor = {
  actionCreator: applyCookieConsent,
  statePredicate: (state) => Boolean(state.cookieConsent.cookieConsentResult),
  async handle() {
    trackMatomo(['setCookieConsentGiven']);

    window.fbq('consent', 'grant');
  },
};
