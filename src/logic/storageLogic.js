import { createLogic } from 'redux-logic';

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
        eleSmoothingFactor: state.trackViewer.eleSmoothingFactor,
      },
      language: state.l10n.language,
    };

    localStorage.setItem('appState', JSON.stringify(appState));
  },
});
