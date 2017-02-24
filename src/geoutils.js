const PI2 = 2 * Math.PI;

export function formatGpsCoord(angle) {
  const degrees = Math.floor(angle);
  const minutes = Math.floor((angle - degrees) * 60);
  const seconds = Math.round((angle - degrees - minutes / 60) * 3600);
  return `${degrees}° ${minutes}' ${seconds}"`;
}

export function distance(lat1, lng1, lat2, lng2) {
  const a = 0.5 - Math.cos(lat2 - lat1) / 2 + Math.cos(lat1) * Math.cos(lat2) * (1 - Math.cos((lng2 - lng1))) / 2;
  return 12742000 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
}

export function bearing(lat1, lng1, lat2, lng2) {
  const dLon = lng2 - lng1;
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  return PI2 - ((Math.atan2(y, x) + PI2) % PI2);
}

export function toRad(deg) {
  return deg * Math.PI / 180;
}
