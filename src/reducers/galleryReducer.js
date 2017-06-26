const initialState = {
  images: [],
  activeImageId: null,
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
    default:
      return state;
  }
}
