import { applyCookieConsent } from 'fm3/actions/mainActions';
import { Processor } from 'fm3/middlewares/processorMiddleware';

export const cookieConsentProcessor: Processor = {
  actionCreator: applyCookieConsent,
  statePredicate: (state) => !!state.main.cookieConsentResult,
  async handle() {
    window.gtag('consent' as any, 'update', {
      ad_storage: 'granted',
      analytics_storage: 'granted',
    });

    // FB PIXEL

    window?.fbq('consent', 'grant');
  },
};
