import * as at from 'fm3/actionTypes';

const initialState = {
  devices: [],
  accessTokens: [],
  modifiedDeviceId: undefined,
  modifiedAccessTokenId: undefined,
  trackedDevices: [],
};

export default function tracking(state = initialState, action) {
  switch (action.type) {
    case at.SET_ACTIVE_MODAL:
      return initialState;
    case at.TRACKING_SET_DEVICES:
      return { ...state, devices: action.payload };
    case at.TRACKING_SET_TRACKED_DEVICES:
      return { ...state, trackedDevices: action.payload };
    case at.TRACKING_MODIFY_DEVICE:
      return { ...state, modifiedDeviceId: action.payload };
    case at.TRACKING_SET_ACCESS_TOKENS:
      return { ...state, accessTokens: action.payload };
    case at.TRACKING_MODIFY_ACCESS_TOKEN:
      return { ...state, modifiedAccessTokenId: action.payload };
    default:
      return state;
  }
}
