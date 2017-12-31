import * as at from 'fm3/actionTypes';

export function setActiveModal(activeModal) {
  return { type: at.SET_ACTIVE_MODAL, payload: activeModal };
}

export function setTool(tool) {
  return { type: at.SET_TOOL, payload: tool };
}

export function setHomeLocation(homeLocation) {
  return { type: at.SET_HOME_LOCATION, payload: homeLocation };
}

export function startProgress(pid) {
  return { type: at.START_PROGRESS, payload: pid };
}

export function stopProgress(pid) {
  return { type: at.STOP_PROGRESS, payload: pid };
}

export function setLocation(lat, lon, accuracy) {
  return { type: at.SET_LOCATION, payload: { lat, lon, accuracy } };
}

export function setExpertMode(value) {
  return { type: at.SET_EXPERT_MODE, payload: value };
}

export function mainLoadState(payload) {
  return { type: at.MAIN_LOAD_STATE, payload };
}

export function exportGpx(exportables) {
  return { type: at.EXPORT_GPX, payload: exportables };
}

export function clearMap() {
  return { type: at.CLEAR_MAP };
}

export function toggleLocate() {
  return { type: at.LOCATE };
}

export function setSelectingHomeLocation(value) {
  return { type: at.SET_SELECTING_HOME_LOCATION, payload: value };
}

export function enableUpdatingUrl() {
  return { type: at.ENABLE_UPDATING_URL };
}

export function reducingError(action, error) {
  return { type: at.REDUCING_ERROR, payload: { action, error } };
}

export function saveSettings(tileFormat, homeLocation, overlayOpacity, overlayPaneOpacity, expertMode, trackViewerEleSmoothingFactor, user, preventTips) {
  return { type: at.SAVE_SETTINGS, payload: { tileFormat, homeLocation, overlayOpacity, overlayPaneOpacity, expertMode, trackViewerEleSmoothingFactor, user, preventTips } };
}
