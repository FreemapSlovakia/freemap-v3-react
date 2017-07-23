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
    case 'SET_ACTIVE_MODAL':
      return {
        ...state,
        items: [],
        pickingPositionForId: null,
      };
    case 'GALLERY_SET_IMAGES':
      return {
        ...state,
        images: action.payload,
        activeImageId: action.payload.length ? action.payload[0].id : null,
      };
    case 'GALLERY_SET_ACTIVE_IMAGE_ID':
      return {
        ...state,
        activeImageId: action.payload,
      };

    case 'GALLERY_ADD_ITEM':
      return {
        ...state,
        items: [...state.items, action.payload],
      };
    case 'GALLERY_REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(({ id }) => action.payload !== id),
      };
    case 'GALLERY_SET_ITEM_URL':
      return {
        ...state,
        items: state.items.map(item => (item.id === action.payload.id ? { ...item, dataURL: action.payload.value } : item)),
      };
    case 'GALLERY_SET_ITEM_TITLE':
      return {
        ...state,
        items: state.items.map(item => (item.id === action.payload.id ? { ...item, title: action.payload.value } : item)),
      };
    case 'GALLERY_SET_ITEM_DESCRIPTION':
      return {
        ...state,
        items: state.items.map(item => (item.id === action.payload.id ? { ...item, description: action.payload.value } : item)),
      };
    case 'GALLERY_SET_PICKING_POSITION':
      return {
        ...state,
        pickingPosition: action.payload,
      };
    case 'GALLERY_CONFIRM_PICKED_POSITION':
      return {
        ...state,
        pickingPositionForId: null,
        pickingPosition: null,
        items: state.items.map(item => (item.id === state.pickingPositionForId ? { ...item, position: state.pickingPosition } : item)),
      };
    case 'GALLERY_SET_ITEM_FOR_POSITION_PICKING':
      return {
        ...state,
        pickingPositionForId: action.payload,
        pickingPosition: typeof action.payload === 'number' ? state.items.find(({ id }) => id === action.payload).position : null,
      };
    default:
      return state;
  }
}
