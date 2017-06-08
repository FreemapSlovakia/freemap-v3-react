const initialState = {
  images: [],
};

export default function elevationMeasurement(state = initialState, action) {
  switch (action.type) {
    case 'MAP_RESET':
    case 'SET_TOOL':
      return initialState;
    case 'GALLERY_SET_IMAGES':
      return { ...state, images: action.payload };
    default:
      return state;
  }
}
