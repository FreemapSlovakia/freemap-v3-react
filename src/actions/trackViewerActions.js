export function trackViewerSetData(trackGpx) {
  return { type: 'TRACK_VIEWER_SET_TRACK_DATA', payload: { trackGpx } };
}

export function trackViewerResetData() {
  return { type: 'TRACK_VIEWER_RESET_TRACK_DATA' };
}
