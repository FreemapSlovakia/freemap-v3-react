export function setTrackData(trackGpx) {
  return { type: 'TRACK_VIEWER_SET_TRACK_DATA', payload: { trackGpx } };
}

export function resetTrackViewer() {
  return { type: 'TRACK_VIEWER_RESET_TRACK_DATA' };
}
