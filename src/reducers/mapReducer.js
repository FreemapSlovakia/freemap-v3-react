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
    case 'RESET_MAP':
      return update(state, { 
        tool: { $set: initialState.tool },
        zoom: { $set: initialState.zoom }, 
        center: { $set: initialState.center }, 
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
        center: {
          lat : { $set: action.lat }, 
          lon : { $set: action.lon }
        }, 
      });
    case 'RESTORE_FROM_URL_PARAMS': {
      const overlays = action.params.mapType && action.params.mapType.substring(1).split('') || [];
      return update(state, { 
        mapType: { $set: action.params.mapType.charAt(0) },
        zoom: { $set: parseInt(action.params.zoom) }, 
        center: {
          lat : { $set: parseFloat(action.params.lat) }, 
          lon : { $set: parseFloat(action.params.lon) }
        }, 
        overlays: { $set: overlays }
      });
    }
    default:
      return state;
  }
}
