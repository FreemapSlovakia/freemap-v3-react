import storage from 'fm3/storage';
import { IProcessor } from 'fm3/middlewares/processorMiddleware';

export const storageProcessor: IProcessor = {
  actionCreator: '*',
  handle: async ({ getState }) => {
    const state = getState();

    const mapState = state.map;

    const appState = {
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
        tileFormat: mapState.tileFormat,
      },
      trackViewer: {
        eleSmoothingFactor: state.main.eleSmoothingFactor,
      },
      language: state.l10n.language,
    };

    storage.setItem('appState', JSON.stringify(appState));
  },
};
