const initialState = {
  images: [],
  activeImageId: null,

  items: [],
  pickingPositionForId: null,
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

    case 'GALLERY_ADD_ITEM':
      return {
        ...state,
        items: [...state.items, action.payload],
        nextId: state.nextId + 1 };
    case 'GALLERY_REMOVE_ITEM':
      return { ...state, items: state.items.filter(({ id }) => action.payload !== id) };
    case 'GALLERY_SET_ITEM_URL':
      return { ...state, items: state.items.map(item => (item.id === action.payload.id ? { ...item, dataURL: action.payload.value } : item)) };
    case 'GALLERY_SET_ITEM_TITLE':
      return { ...state, items: state.items.map(item => (item.id === action.payload.id ? { ...item, title: action.payload.value } : item)) };
    case 'GALLERY_SET_ITEM_DESCRIPTION':
      return { ...state, items: state.items.map(item => (item.id === action.payload.id ? { ...item, description: action.payload.value } : item)) };
    case 'GALLERY_SET_ITEM_POSITION':
      return { ...state, items: state.items.map(item => (item.id === action.payload.id ? { ...item, position: action.payload.value } : item)) };
    case 'GALLERY_PICK_ITEM_POSITION':
      return { ...state, pickingPositionForId: action.payload };
    default:
      return state;
  }
}
