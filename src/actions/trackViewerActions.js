export function trackViewerSetData(payload) {
  return { type: 'TRACK_VIEWER_SET_TRACK_DATA', payload };
}

export function trackViewerSetTrackUID(trackUID) {
  return { type: 'TRACK_VIEWER_SET_TRACK_UID', payload: trackUID };
}

export function trackViewerDownloadTrack(trackUID) {
  return { type: 'TRACK_VIEWER_DOWNLOAD_TRACK', payload: trackUID };
}

export function trackViewerUploadTrack() {
  return { type: 'TRACK_VIEWER_UPLOAD_TRACK' };
}

export function trackViewerSetEleSmoothingFactor(eleSmoothingFactor) {
  return { type: 'TRACK_VIEWER_SET_ELE_SMOOTHING_FACTOR', payload: eleSmoothingFactor };
}

export function trackViewerLoadState(payload) {
  return { type: 'TRACK_VIEWER_LOAD_STATE', payload };
}

export function trackViewerColorizeTrackBy(colorizeTrackBy) {
  return { type: 'TRACK_VIEWER_COLORIZE_TRACK_BY', payload: colorizeTrackBy };
}

export function trackViewerShowInfo() {
  return { type: 'TRACK_VIEWER_SHOW_INFO' };
}

export function trackViewerToggleElevationChart() {
  return { type: 'TRACK_VIEWER_TOGGLE_ELEVATION_CHART' };
}

export function trackViewerGpxLoad(gpxUrl) {
  return { type: 'TRACK_VIEWER_GPX_LOAD', payload: gpxUrl };
}
