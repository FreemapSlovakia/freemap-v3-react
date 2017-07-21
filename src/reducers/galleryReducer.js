const initialState = {
  images: [],
  activeImageId: null,

  nextId: 0,
  items: [],
};

export default function elevationMeasurement(state = initialState, action) {
  switch (action.type) {
    case 'MAP_RESET':
    case 'SET_TOOL':
      return initialState;
    case 'GALLERY_SET_IMAGES':
      return { ...state, images: action.payload, activeImageId: action.payload.length ? action.payload[0].id : null };
    case 'GALLERY_SET_ACTIVE_IMAGE_ID':
      return { ...state, activeImageId: action.payload };

    case 'GALLERY_ADD_ITEMS':
      return {
        ...state,
        items: [...state.items, ...action.payload.map((item, i) => ({ ...item, id: state.nextId + i }))],
        nextId: state.nextId + action.payload.length };
    case 'GALLERY_REMOVE_ITEM':
      return { ...state, items: state.items.filter(({ id }) => action.payload !== id) };
    case 'GALLERY_SET_TITLE':
      return { ...state, items: state.items.map(item => (item.id === action.payload.id ? { ...item, title: action.payload.value } : item)) };
    case 'GALLERY_SET_DESCRIPTION':
      return { ...state, items: state.items.map(item => (item.id === action.payload.id ? { ...item, description: action.payload.value } : item)) };
    case 'GALLERY_SET_POSITION':
      return { ...state, items: state.items.map(item => (item.id === action.payload.id ? { ...item, position: action.payload.value } : item)) };
    default:
      return state;
  }
}
