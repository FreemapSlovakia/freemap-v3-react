import { Middleware } from '@reduxjs/toolkit';
import storage from 'local-storage-fallback';
import type { RootState } from '../store.js';

export const statePersistingMiddleware: Middleware<{}, RootState> =
  ({ getState }) =>
  (next) =>
  (action) => {
    const result = next(action);

    const state = getState();

    if (state.main.cookieConsentResult !== null) {
      persistSelectedState(state);
    }

    return result;
  };

function persistSelectedState(state: RootState) {
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
        hiddenInfoBars: state.main.hiddenInfoBars,
        drawingColor: state.main.drawingColor,
        drawingWidth: state.main.drawingWidth,
        drawingRecentColors: state.main.drawingRecentColors,
      },
      objects: {
        selectedIcon: state.objects.selectedIcon,
      },
      routePlanner: {
        preventHint: state.routePlanner.preventHint,
        transportType: state.routePlanner.transportType,
        milestones: state.routePlanner.milestones,
      },
      auth: {
        user: state.auth.user && {
          ...state.auth.user,
          premiumExpiration: state.auth.user.premiumExpiration
            ? state.auth.user.premiumExpiration.toISOString()
            : null,
        },
      },
      map: {
        layersSettings: state.map.layersSettings,
        mapType: state.map.mapType,
        lat: state.map.lat,
        lon: state.map.lon,
        zoom: state.map.zoom,
        overlays: state.map.overlays,
        customLayers: state.map.customLayers,
        legacyMapWarningSuppressions: state.map.legacyMapWarningSuppressions,
        shading: state.map.shading,
      },
      gallery: {
        colorizeBy: state.gallery.colorizeBy,
        showDirection: state.gallery.showDirection,
        recentTags: state.gallery.recentTags,
      },
    } as Partial<RootState>),
  );
}
