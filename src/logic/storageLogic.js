import { createLogic } from 'redux-logic';

export default createLogic({
  type: '*',
  process({ getState }) {
    const state = getState();

    const mapState = state.map;

    const appState = {
      main: {
        homeLocation: state.main.homeLocation,
        tool: null
      },
      routePlanner: {
        transportType: state.routePlanner.transportType
      },
      map: {
        mapType: mapState.mapType,
        lat: mapState.lat,
        lon: mapState.lon,
        zoom: mapState.zoom,
        overlays: mapState.overlays,
        bounds: mapState.bounds,
        tileFormat: mapState.tileFormat
      }
    };

    localStorage.setItem('appState', JSON.stringify(appState));
  }
});
