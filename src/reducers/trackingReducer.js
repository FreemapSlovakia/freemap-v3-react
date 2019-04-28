import * as at from 'fm3/actionTypes';

const initialState = {
  devices: [],
  accessTokens: [],
  trackedDevices: [],
  accessTokensDeviceId: undefined,
  modifiedDeviceId: undefined,
  modifiedAccessTokenId: undefined,
  modifiedTrackedDeviceId: undefined,
};

export default function tracking(state = initialState, action) {
  switch (action.type) {
    case at.CLEAR_MAP:
      return initialState;
    case at.SET_ACTIVE_MODAL:
      return {
        ...initialState,
        trackedDevices: state.trackedDevices,
      };
    case at.TRACKING_SET_DEVICES:
      return { ...state, devices: action.payload, accessTokens: [] };
    case at.TRACKING_SET_TRACKED_DEVICES:
      return { ...state, trackedDevices: action.payload };
    case at.TRACKING_MODIFY_DEVICE:
      return { ...state, modifiedDeviceId: action.payload };
    case at.TRACKING_SET_ACCESS_TOKENS:
      return { ...state, accessTokens: action.payload };
    case at.TRACKING_MODIFY_ACCESS_TOKEN:
      return { ...state, modifiedAccessTokenId: action.payload };
    case at.TRACKING_SHOW_ACCESS_TOKENS:
      return { ...state, accessTokensDeviceId: action.payload };
    case at.TRACKING_MODIFY_TRACKED_DEVICE:
      return { ...state, modifiedTrackedDeviceId: action.payload };
    case at.TRACKING_SAVE_TRACKED_DEVICE:
      return {
        ...state,
        trackedDevices: [...state.trackedDevices.filter(d => d.id !== action.payload.id), action.payload],
        modifiedTrackedDeviceId: undefined,
      };
    case at.TRACKING_DELETE_TRACKED_DEVICE:
      return {
        ...state,
        trackedDevices: state.trackedDevices.filter(d => d.id !== action.payload),
      };
    default:
      return state;
  }
}
