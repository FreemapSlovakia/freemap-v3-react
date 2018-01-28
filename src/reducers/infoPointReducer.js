import * as at from 'fm3/actionTypes';

const initialState = {
  points: [],
  activeIndex: null,
  change: 0,
};

export default function infoPoint(state = initialState, action) {
  switch (action.type) {
    case at.CLEAR_MAP:
      return initialState;
    case at.SET_TOOL:
      return { ...state, activeIndex: action.payload === 'info-point' ? state.activeIndex : null };
    case at.INFO_POINT_ADD:
      return {
        ...state,
        points: [...state.points, { lat: action.payload.lat, lon: action.payload.lon, label: action.payload.label }],
        change: state.change + 1,
        activeIndex: state.points.length,
      };
    case at.INFO_POINT_DELETE:
      return {
        ...state,
        points: state.points.filter((_, i) => state.activeIndex !== i),
        change: state.change + 1,
        activeIndex: null,
      };
    case at.INFO_POINT_CHANGE_POSITION:
      return {
        ...state,
        points: state.points.map((point, i) => (i === state.activeIndex ? { ...point, lat: action.payload.lat, lon: action.payload.lon } : point)),
      };
    case at.INFO_POINT_CHANGE_LABEL:
      return {
        ...state,
        points: state.points.map((point, i) => (i === state.activeIndex ? { ...point, label: action.payload } : point)),
      };
    case at.INFO_POINT_SET_ACTIVE_INDEX:
      return {
        ...state,
        activeIndex: state.activeIndex === action.payload ? null : action.payload,
      };
    case at.INFO_POINT_SET_ALL:
      return {
        ...state,
        points: action.payload,
      };
    default:
      return state;
  }
}
