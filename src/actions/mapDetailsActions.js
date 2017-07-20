export function mapDetailsSetSubtool(subtool) {
  return { type: 'MAP_DETAILS_SET_SUBTOOL', payload: { subtool } };
}

export function mapDetailsSetUserSelectedPosition(lat, lon) {
  return { type: 'MAP_DETAILS_SET_USER_SELECTED_POSITION', payload: { lat, lon } };
}

export function mapDetailsSetTrackInfoPoints(trackInfoPoints) {
  return { type: 'MAP_DETAILS_SET_TRACK_INFO_POINTS', payload: { trackInfoPoints } };
}
