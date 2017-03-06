import update from 'immutability-helper';

const initialState = {
  tool: null,
  mapType: 'T',
  center: {
    lat: 48.70714,
    lon: 19.4995
  },
  zoom: 8,
  overlays: []
};


export default function map(state = initialState, action) {
  switch (action.type) {
    case 'SET_TOOL':
      return update(state, { tool: { $set: action.tool === state.tool ? null : action.tool } } );
    case 'SET_MAP_CENTER':
      return update(state, { center: { $set: action.center } } );
    case 'SET_MAP_ZOOM':
      return update(state, { zoom: { $set: action.zoom } } );
    case 'SET_MAP_TYPE':
      return update(state, { mapType: { $set: action.mapType } } );
    case 'SET_MAP_OVERLAYS':
      return update(state, { overlays: { $set: action.overlays } } );
    default:
      return state;
  }
}
