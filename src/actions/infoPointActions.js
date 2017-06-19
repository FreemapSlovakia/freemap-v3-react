export function infoPointAdd(lat, lon, label) {
  return { type: 'INFO_POINT_ADD', payload: { lat, lon, label } };
}
