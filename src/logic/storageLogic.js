import { createLogic } from 'redux-logic';
import storage from 'fm3/storage';

export default createLogic({
  type: '*',
  process({ getState }) {
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
});
