const initialState = {
  mapType: 'T',
  lat: 48.70714,
  lon: 19.4995,
  zoom: 8,
  overlays: [],
  overlayOpacity: {},
  tileFormat: 'png',
};

export default function map(state = initialState, action) {
  switch (action.type) {
    // TODO improve validation
    case 'MAP_LOAD_STATE': {
      const s = { ...state };
      const {
        mapType, lat, lon, zoom, overlays, overlayOpacity, tileFormat,
      } = action.payload;
      if (mapType) {
        s.mapType = mapType;
      }
      if (typeof lat === 'number') {
        s.lat = lat;
      }
      if (typeof lon === 'number') {
        s.lon = lon;
      }
      if (typeof zoom === 'number') {
        s.zoom = zoom;
      }
      if (Array.isArray(overlays)) {
        s.overlays = [...overlays];
      }
      if (overlayOpacity) {
        s.overlayOpacity = { ...initialState.overlayOpacity, ...overlayOpacity };
      }
      if (tileFormat) {
        s.tileFormat = tileFormat;
      }
      return s;
    }
    case 'MAP_RESET':
      return {
        ...state,
        zoom: initialState.zoom,
        lat: initialState.lat,
        lon: initialState.lon,
      };
    case 'MAP_SET_TILE_FORMAT':
      return { ...state, tileFormat: action.payload };
    case 'MAP_SET_OVERLAY_OPACITY':
      return { ...state, overlayOpacity: action.payload };
    case 'MAP_REFOCUS': {
      const newState = { ...state };
      ['zoom', 'lat', 'lon', 'mapType', 'overlays'].forEach((prop) => {
        if (prop in action.payload) {
          newState[prop] = action.payload[prop];
        }
      });

      return newState;
    }
    case 'AUTH_SET_USER': {
      const settings = action.payload && action.payload.settings;
      return settings ? {
        ...state,
        tileFormat: settings.tileFormat || state.tileFormat,
        overlayOpacity: settings.overlayOpacity === undefined ? state.overlayOpacity : settings.overlayOpacity,
      } : state;
    }
    default:
      return state;
  }
}
