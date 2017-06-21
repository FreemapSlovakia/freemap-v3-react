export function infoPointAdd(lat, lon, label) {
  return { type: 'INFO_POINT_ADD', payload: { lat, lon, label } };
}

export function infoPointChangePosition(lat, lon) {
  return { type: 'INFO_POINT_CHANGE_POSITION', payload: { lat, lon } };
}

export function infoPointSetInEditMode(inEditMode) {
  return { type: 'INFO_POINT_SET_IN_EDIT_MODE', payload: { inEditMode } };
}

export function infoPointChangeLabel(label) {
  return { type: 'INFO_POINT_CHANGE_LABEL', payload: { label } };
}

