import { RootAction } from 'fm3/actions';
import { allowCookies, selectFeature } from 'fm3/actions/mainActions';
import { tipsShow } from 'fm3/actions/tipsActions';
import { storage } from 'fm3/storage';
import { RootState } from 'fm3/storeCreator';
import { Dispatch, Middleware } from 'redux';
import { isActionOf } from 'typesafe-actions';

// TODO to processors

export const utilityMiddleware: Middleware<unknown, RootState, Dispatch> = ({
  getState,
}) => (next: Dispatch) => (action: RootAction): unknown => {
  const result = next(action);

  if (isActionOf(selectFeature, action)) {
    const { selection } = getState().main;

    if (selection) {
      window.gtag('event', 'setTool', {
        event_category: 'Main',
        value: selection.type,
      });
    }
  } else if (isActionOf(allowCookies, action)) {
    localStorage.setItem('cookieConsentResult', JSON.stringify(action.payload));

    if (action.payload.includes('gtag')) {
      window.gtag('consent' as any, 'update', {
        ad_storage: 'granted',
        analytics_storage: 'granted',
      });

      // FB PIXEL; NOTE we will use `gtag` for all such features

      window?.fbq('consent', 'grant');
    }
  } else if (isActionOf(tipsShow, action)) {
    const { tip } = getState().tips;

    if (tip) {
      storage.setItem('tip', tip);
    } else {
      storage.removeItem('tip');
    }
  }

  return result;
};
