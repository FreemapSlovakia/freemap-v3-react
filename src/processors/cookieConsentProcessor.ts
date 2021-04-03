import { applyCookieConsent } from 'fm3/actions/mainActions';
import { Processor } from 'fm3/middlewares/processorMiddleware';

export const cookieConsentProcessor: Processor = {
  actionCreator: applyCookieConsent,
  handle: async ({ getState }) => {
    if (getState().main.cookieConsentResult) {
      window.gtag('consent' as any, 'update', {
        ad_storage: 'granted',
        analytics_storage: 'granted',
      });

      // FB PIXEL

      window?.fbq('consent', 'grant');
    }
  },
};
