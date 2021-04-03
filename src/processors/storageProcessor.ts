import { Processor } from 'fm3/middlewares/processorMiddleware';
import { AppState } from 'fm3/types/common';
import storage from 'local-storage-fallback';

export const storageProcessor: Processor = {
  actionCreator: '*',
  handle: async ({ getState }) => {
    if (window.self !== window.top) {
      return;
    }

    const state = getState();

    const mapState = state.map;

    const appState: AppState = {
      version: 1,
      main: {
        homeLocation: state.main.homeLocation,
        expertMode: state.main.expertMode,
      },
      routePlanner: {
        transportType: state.routePlanner.transportType,
      },
      map: {
        mapType: mapState.mapType,
        lat: mapState.lat,
        lon: mapState.lon,
        zoom: mapState.zoom,
        overlays: mapState.overlays,
        overlayOpacity: mapState.overlayOpacity,
        overlayPaneOpacity: mapState.overlayPaneOpacity,
      },
      trackViewer: {
        eleSmoothingFactor: state.main.eleSmoothingFactor,
      },
      language: state.l10n.chosenLanguage,
    };

    storage.setItem('appState', JSON.stringify(appState));
  },
};
