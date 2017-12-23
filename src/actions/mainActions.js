export function setActiveModal(activeModal) {
  return { type: 'SET_ACTIVE_MODAL', payload: activeModal };
}

export function setTool(tool) {
  return { type: 'SET_TOOL', payload: tool };
}

export function setHomeLocation(homeLocation) {
  return { type: 'SET_HOME_LOCATION', payload: homeLocation };
}

export function startProgress(pid) {
  return { type: 'START_PROGRESS', payload: pid };
}

export function stopProgress(pid) {
  return { type: 'STOP_PROGRESS', payload: pid };
}

export function setLocation(lat, lon, accuracy) {
  return { type: 'SET_LOCATION', payload: { lat, lon, accuracy } };
}

export function setExpertMode(value) {
  return { type: 'SET_EXPERT_MODE', payload: value };
}

export function mainLoadState(payload) {
  return { type: 'MAIN_LOAD_STATE', payload };
}

export function exportGpx(exportables) {
  return { type: 'EXPORT_GPX', payload: exportables };
}

export function clearMap() {
  return { type: 'CLEAR_MAP' };
}

export function toggleLocate() {
  return { type: 'LOCATE' };
}

export function setSelectingHomeLocation(value) {
  return { type: 'SET_SELECTING_HOME_LOCATION', payload: value };
}
