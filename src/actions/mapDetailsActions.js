import * as at from 'fm3/actionTypes';

export function mapDetailsSetSubtool(subtool) {
  return { type: at.MAP_DETAILS_SET_SUBTOOL, payload: subtool };
}

export function mapDetailsSetUserSelectedPosition(lat, lon) {
  return {
    type: at.MAP_DETAILS_SET_USER_SELECTED_POSITION,
    payload: { lat, lon },
  };
}

export function mapDetailsSetTrackInfoPoints(trackInfoPoints) {
  return {
    type: at.MAP_DETAILS_SET_TRACK_INFO_POINTS,
    payload: trackInfoPoints,
  };
}
