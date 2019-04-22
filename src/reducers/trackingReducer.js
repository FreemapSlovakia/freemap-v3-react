import * as at from 'fm3/actionTypes';

const initialState = {
  devices: [],
  trackedDevices: [],
};

export default function tracking(state = initialState, action) {
  switch (action.type) {
    case at.TRACKING_SET_DEVICES:
      return { ...state, devices: action.payload };
    case at.TRACKING_SET_TRACKED_DEVICES:
      return { ...state, trackedDevices: action.payload };
    default:
      return state;
  }
}
