import update from 'immutability-helper';

const initialState = {
  objectsModalShown: false,
  objects: []
};


export default function map(state = initialState, action) {
  switch (action.type) {
    case 'SHOW_OBJECTS_MODAL':
      return update(state, { objectsModalShown: { $set: true } } );
    case 'SET_OBJECTS_FILTER':
      return update(state, { objectsModalShown: { $set: false } } );
    case 'SET_OBJECTS':
      return update(state, { objectsModalShown: { $set: false }, objects: { $set: true } } );
    case 'CANCEL_OBJECTS_MODAL':
      return update(state, { objectsModalShown: { $set: false } } );
    default:
      return state;
  }
}
