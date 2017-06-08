export function trackViewerSetData(trackGpx) {
  return { type: 'TRACK_VIEWER_SET_TRACK_DATA', payload: { trackGpx } };
}

export function trackViewerResetData() {
  return { type: 'TRACK_VIEWER_RESET_TRACK_DATA' };
}

export function trackViewerSetTrackUID(trackUID) {
  return { type: 'TRACK_VIEWER_SET_TRACK_UID', payload: { trackUID } };
}

export function trackViewerResetTrackUID() {
  return { type: 'TRACK_VIEWER_RESET_TRACK_UID' };
}

export function trackViewerDownloadTrack(trackUID) {
  return { type: 'TRACK_VIEWER_DOWNLOAD_TRACK', payload: { trackUID } };
}

export function trackViewerUploadTrack() {
  return { type: 'TRACK_VIEWER_UPLOAD_TRACK' };
}
