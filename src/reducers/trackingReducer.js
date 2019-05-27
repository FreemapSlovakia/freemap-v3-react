import * as at from 'fm3/actionTypes';
import produce from 'immer';

const initialState = {
  devices: [],
  accessTokens: [],
  accessTokensDeviceId: undefined,
  modifiedDeviceId: undefined,
  modifiedAccessTokenId: undefined,
  modifiedTrackedDeviceId: undefined,
  trackedDevices: [],
  tracks: [],
  showLine: true,
  showPoints: true,
  activeTrackId: null,
};

export default function tracking(state = initialState, action) {
  switch (action.type) {
    case at.CLEAR_MAP:
      return initialState;
    case at.SET_ACTIVE_MODAL:
      return {
        ...initialState,
        trackedDevices: state.trackedDevices,
        tracks: state.tracks,
      };
    case at.TRACKING_SET_DEVICES:
      return { ...state, devices: action.payload, accessTokens: [] };
    case at.TRACKING_MODIFY_DEVICE:
      return { ...state, modifiedDeviceId: action.payload };
    case at.TRACKING_SET_ACCESS_TOKENS:
      return { ...state, accessTokens: action.payload };
    case at.TRACKING_MODIFY_ACCESS_TOKEN:
      return { ...state, modifiedAccessTokenId: action.payload };
    case at.TRACKING_SHOW_ACCESS_TOKENS:
      return { ...state, accessTokensDeviceId: action.payload };

    case at.TRACKING_SET_TRACKED_DEVICES:
      return { ...state, trackedDevices: action.payload };
    case at.TRACKING_MODIFY_TRACKED_DEVICE:
      return { ...state, modifiedTrackedDeviceId: action.payload };
    case at.TRACKING_SAVE_TRACKED_DEVICE:
      return {
        ...state,
        trackedDevices: [...state.trackedDevices.filter(d => d.id !== state.modifiedTrackedDeviceId), action.payload],
        modifiedTrackedDeviceId: undefined,
      };
    case at.TRACKING_DELETE_TRACKED_DEVICE:
      return {
        ...state,
        trackedDevices: state.trackedDevices.filter(d => d.id !== action.payload),
      };
    case at.TRACKING_VIEW:
      return produce(state, (draft) => {
        if (!draft.trackedDevices.find(d => d.id !== action.payload)) {
          draft.trackedDevices.push({
            id: action.payload,
          });
        }
      });
    case at.TRACKING_SET_ACTIVE:
      return { ...state, activeTrackId: state.activeTrackId === action.payload ? null : action.payload };
    case at.WS_STATE_CHANGED:
      return action.payload.state === 1 ? state : { ...state, tracks: [] };

    case at.RPC_RESPONSE: {
      if (action.payload.method === 'tracking.subscribe' && action.payload.result) {
        return {
          ...state,
          tracks: [
            ...state.tracks,
            {
              id: action.payload.params.token || action.payload.params.deviceId,
              trackPoints: action.payload.result.map(tp => ({ ...tp, ts: new Date(tp.ts) })),
            },
          ],
        };
      }

      if (action.payload.method === 'tracking.unsubscribe' && !action.payload.error) {
        return {
          ...state,
          tracks: state.tracks.filter(track => track.id !== action.payload.params.token || action.payload.params.deviceId),
        };
      }

      return state;
    }
    case at.RPC_EVENT: {
      if (action.payload.method === 'tracking.addPoint') {
        // rest: id, lat, lon, altitude, speed, accuracy, bearing, battery, gsmSignal, message, ts
        const { token, deviceId, ts, ...rest } = action.payload.params;
        return produce(state, (draft) => {
          let track = draft.tracks.find(t => t.id === token || deviceId);
          if (!track) {
            track = { id: token || deviceId, trackPoints: [] };
            draft.tracks.push(track);
          }
          track.trackPoints.push({ ts: new Date(ts), ...rest });
          // TODO apply limits from trackedDevices
        });
      }

      return state;
    }
    case at.TRACKING_SET_SHOW_POINTS:
      return { ...state, showPoints: action.payload };
    case at.TRACKING_SET_SHOW_LINE:
      return { ...state, showLine: action.payload };
    default:
      return state;
  }
}
