const initialState = {
  mapType: 'T',
  lat: 48.70714,
  lon: 19.4995,
  zoom: 8,
  overlays: [],
  bounds: {
    south: 0,
    west: 0,
    east: 0,
    north: 0
  },

  tileFormat: 'png'
};

export default function map(state = initialState, action) {
  switch (action.type) {
    case 'RESET_MAP':
      return Object.assign({}, state, {
        zoom: initialState.zoom,
        lat: initialState.lat,
        lon: initialState.lon
      });
    case 'SET_MAP_BOUNDS':
      return Object.assign({}, state, { bounds: action.bounds });
    case 'SET_MAP_TILE_FORMAT':
      return Object.assign({}, state, { tileFormat: action.tileFormat });
    case 'REFOCUS': {
      const newState = Object.assign({}, state);
      [ 'zoom', 'lat', 'lon', 'mapType', 'overlays' ].forEach(prop => {
        if (prop in action) {
          newState[prop] = action[prop];
        }
      });

      return newState;
    }
    default:
      return state;
  }
}
