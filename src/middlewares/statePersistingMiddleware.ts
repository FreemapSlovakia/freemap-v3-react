import { Middleware } from '@reduxjs/toolkit';
import storage from 'local-storage-fallback';
import { RootState } from '../store.js';

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
        user: state.auth.user,
      },
      map: {
        layersSettings: state.map.layersSettings,
        overlayPaneOpacity: state.map.overlayPaneOpacity,
        mapType: state.map.mapType,
        lat: state.map.lat,
        lon: state.map.lon,
        zoom: state.map.zoom,
        overlays: state.map.overlays,
        customLayers: state.map.customLayers,
        legacyMapWarningSuppressions: state.map.legacyMapWarningSuppressions,
      },
      gallery: {
        colorizeBy: state.gallery.colorizeBy,
        recentTags: state.gallery.recentTags,
      },
    } as Partial<RootState>),
  );
}
