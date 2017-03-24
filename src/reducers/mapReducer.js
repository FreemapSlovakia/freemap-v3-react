import update from 'immutability-helper';

const initialState = {
  mapType: 'T',
  lat: 48.70714,
  lon: 19.4995,
  zoom: 8,
  overlays: [],
  overlayOpacity: { N: 1.0 },
  tileFormat: 'png'
};

export default function map(state = initialState, action) {
  switch (action.type) {
    case 'MAP_RESET':
      return { ...state,
        zoom: initialState.zoom,
        lat: initialState.lat,
        lon: initialState.lon
      };
    case 'MAP_SET_TILE_FORMAT':
      return { ...state, tileFormat: action.payload };
    case 'MAP_SET_OVERLAY_OPACITY':
      return update(state, { overlayOpacity: { [ action.overlayType ]: { $set: action.overlayOpacity } } });
    case 'MAP_REFOCUS': {
      const newState = { ...state };
      [ 'zoom', 'lat', 'lon', 'mapType', 'overlays' ].forEach(prop => {
        if (prop in action.payload) {
          newState[prop] = action.payload[prop];
        }
      });

      return newState;
    }
    default:
      return state;
  }
}
