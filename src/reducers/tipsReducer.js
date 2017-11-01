const tips = [
  'attribution',
  'exports',
  'freemap',
  'galleryUpload',
  'osm',
  'sharing',
  'shortcuts',
];

const initialState = {
  tip: 'attribution',
  preventNextTime: false,
};

export default function infoPoint(state = initialState, action) {
  switch (action.type) {
    case 'TIPS_NEXT':
      return { ...state, tip: tips[(tips.indexOf(action.payload === null ? 'attribution' : action.payload || state.tip) + 1) % tips.length] };
    case 'TIPS_PREVIOUS':
      return { ...state, tip: tips[(tips.indexOf(state.tip) + tips.length - 1) % tips.length] };
    case 'TIPS_PREVENT_NEXT_TIME':
      return { ...state, preventNextTime: action.payload };
    default:
      return state;
  }
}
