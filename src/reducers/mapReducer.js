import update from 'immutability-helper';

const initialState = {
  tool: null,

  mapType: 'T',
  lat: 48.70714,
  lon: 19.4995,
  zoom: 8,
  overlays: []
};

export default function map(state = initialState, action) {
  switch (action.type) {
    case 'SET_TOOL':
      return update(state, { tool: { $set: action.tool } } );
    case 'RESET_MAP':
      return update(state, {
        tool: { $set: initialState.tool },
        zoom: { $set: initialState.zoom },
        lat: { $set: initialState.lat },
        lon: { $set: initialState.lon }
      });
    case 'SET_MAP_BOUNDS':
      return update(state, { bounds: { $set: action.bounds } } );
    case 'SET_MAP_TYPE':
      return update(state, { mapType: { $set: action.mapType } } );
    case 'SET_MAP_OVERLAYS':
      return update(state, { overlays: { $set: action.overlays } } );
    case 'REFOCUS':
      return update(state, {
        zoom: { $set: action.zoom },
        lat : { $set: action.lat },
        lon : { $set: action.lon }
      });
    default:
      return state;
  }
}
