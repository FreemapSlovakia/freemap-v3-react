import { RootAction } from 'fm3/actions';
import storage from 'local-storage-fallback';
import { DefaultRootState } from 'react-redux';
import { Dispatch, Middleware } from 'redux';

export const statePersistingMiddleware: Middleware<
  RootAction | null,
  DefaultRootState,
  Dispatch<RootAction>
> =
  ({ getState }) =>
  (next: Dispatch) =>
  (action: RootAction): RootAction | null => {
    const result = next(action);

    const state = getState();

    if (state.main.cookieConsentResult !== null) {
      persistSelectedState(state);
    }

    return result;
  };

function persistSelectedState(state: DefaultRootState) {
  if (window.fmEmbedded) {
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
      gallery: {
        colorizeBy: state.gallery.colorizeBy,
      },
    } as Partial<DefaultRootState>),
  );
}
