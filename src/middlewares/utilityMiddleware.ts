import { RootAction } from 'fm3/actions';
import { applyCookieConsent, selectFeature } from 'fm3/actions/mainActions';
import { RootState } from 'fm3/storeCreator';
import storage from 'local-storage-fallback';
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
  } else if (isActionOf(applyCookieConsent, action)) {
    if (getState().main.cookieConsentResult) {
      window.gtag('consent' as any, 'update', {
        ad_storage: 'granted',
        analytics_storage: 'granted',
      });

      // FB PIXEL

      window?.fbq('consent', 'grant');
    }
  }

  const state = getState();

  if (state.main.cookieConsentResult !== null) {
    persistSelectedState(state);
  }

  return result;
};

function persistSelectedState(state: RootState) {
  if (window.self !== window.top) {
    return;
  }

  storage.setItem(
    'store',
    JSON.stringify({
      l10n: {
        chosenLanguage: state.l10n.chosenLanguage,
      },
      main: {
        cookieConsentResult: state.main.cookieConsentResult,
        homeLocation: state.main.homeLocation,
        expertMode: state.main.expertMode,
      },
      tips: {
        lastTip: state.tips.lastTip,
        preventTips: state.tips.preventTips,
      },
      routePlanner: {
        preventHint: state.routePlanner.preventHint,
        transportType: state.routePlanner.transportType,
      },
      auth: {
        user: state.auth.user,
      },
      trackViewer: {
        eleSmoothingFactor: state.trackViewer.eleSmoothingFactor,
      },
      map: {
        overlayOpacity: state.map.overlayOpacity,
        overlayPaneOpacity: state.map.overlayPaneOpacity,
        mapType: state.map.mapType,
        lat: state.map.lat,
        lon: state.map.lon,
        zoom: state.map.zoom,
        overlays: state.map.overlays,
      },
    } as Partial<RootState>),
  );
}
