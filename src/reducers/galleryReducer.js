const initialState = {
  imageIds: null,
  activeImageId: null,
  image: null,

  items: [],
  pickingPositionForId: null,

  uploadingId: null,

  tags: [],

  uploadSeq: 0,
  comment: '',
  showFilter: false,
};

export default function elevationMeasurement(state = initialState, action) {
  switch (action.type) {
    case 'MAP_RESET':
    case 'SET_TOOL':
      return { ...initialState, uploadSeq: state.uploadSeq };
    case 'SET_ACTIVE_MODAL':
      return {
        ...state,
        items: [],
        pickingPositionForId: null,
      };
    case 'GALLERY_SET_IMAGE_IDS':
      return {
        ...state,
        imageIds: action.payload,
      };
    case 'GALLERY_CLEAR':
      return {
        ...state,
        imageIds: null,
        image: null,
        activeImageId: null,
      };
    case 'GALLERY_SET_IMAGE':
      return {
        ...state,
        image: action.payload,
      };
    case 'GALLERY_REQUEST_IMAGE':
      return {
        ...state,
        activeImageId: action.payload,
        comment: '',
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
    case 'GALLERY_SET_ITEM_IS_UPLOADED':
      return {
        ...state,
        items: state.items.map(item => (item.id === action.payload ? { ...item, uploaded: true } : item)),
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
    case 'GALLERY_SET_ITEM_TAKEN_AT':
      return {
        ...state,
        items: state.items.map(item => (item.id === action.payload.id ? { ...item, takenAt: action.payload.value } : item)),
      };
    case 'GALLERY_SET_ITEM_TAGS':
      return {
        ...state,
        items: state.items.map(item => (item.id === action.payload.id ? { ...item, tags: action.payload.value } : item)),
      };
    case 'GALLERY_SET_ITEM_ERROR':
      return {
        ...state,
        items: state.items.map(item => (item.id === action.payload.id ? { ...item, error: action.payload.value } : item)),
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
    case 'GALLERY_UPLOAD':
    {
      const items = state.uploadingId === null ? state.items.map(item => ({ ...item, error: getError(item) })) : state.items;
      const next = items.find(item => !item.error && !item.uploaded);

      return {
        ...state,
        items,
        uploadingId: next ? next.id : null,
      };
    }
    case 'GALLERY_SET_TAGS':
      return { ...state, tags: action.payload };
    case 'GALLERY_SET_LAYER_DIRTY':
      return { ...state, uploadSeq: state.uploadSeq + 1 };
    case 'GALLERY_SET_COMMENT':
      return { ...state, comment: action.payload };
    case 'GALLERY_SET_FILTER_SHOWN':
      return { ...state, showFilter: action.payload };
    default:
      return state;
  }
}

function getError(item) {
  const errors = [];
  if (!item.position) {
    errors.push('Chýba pozícia.');
  }
  if (item.takenAt && isNaN(item.takenAt)) {
    errors.push('Nevalidný dátum a čas fotenia.');
  }
  return errors.length ? errors.join('\n') : null;
}
