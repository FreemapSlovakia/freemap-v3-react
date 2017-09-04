export function infoPointSet(lat, lon, label) {
  return { type: 'INFO_POINT_SET', payload: { lat, lon, label } };
}

export function infoPointChangePosition(lat, lon) {
  return { type: 'INFO_POINT_CHANGE_POSITION', payload: { lat, lon } };
}

export function infoPointChangeLabel(label) {
  return { type: 'INFO_POINT_CHANGE_LABEL', payload: label };
}

