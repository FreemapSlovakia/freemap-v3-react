const PI2 = 2 * Math.PI;

export function formatGpsCoord(angle) {
  const degrees = Math.floor(angle);
  const minutes = Math.floor((angle - degrees) * 60);
  const seconds = Math.round((angle - degrees - minutes / 60) * 3600);
  return `${degrees}° ${minutes}' ${seconds}"`;
}

export function distance(lat1, lon1, lat2, lon2) {
  const a = 0.5 - Math.cos(toRad(lat2 - lat1)) / 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * (1 - Math.cos(toRad(lon2 - lon1))) / 2;
  return 12742000 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
}

export function bearing(lat1, lon1, lat2, lon2) {
  const dLon = lon2 - lon1;
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  return PI2 - ((Math.atan2(y, x) + PI2) % PI2);
}

export function toRad(deg) {
  return deg * Math.PI / 180;
}

function dimensionsOf(geojson) {
  const bounds = L.geoJson(geojson).getBounds();
  const north = bounds.getNorth();
  const west = bounds.getWest();
  const south = bounds.getSouth();
  const east = bounds.getEast();
  
  const northToSouthMeters = distance(north, west, south, west);
  const westToEastMeters = distance(north, west, north, east);
  
  return { northToSouthMeters, westToEastMeters };
}

export function zoomLevelToFit(geojson) { // for Slovakia
  const { northToSouthMeters, westToEastMeters } = dimensionsOf(geojson);
  const largerDimension = (northToSouthMeters > westToEastMeters) ? northToSouthMeters : westToEastMeters;
  const maxMeters = 600;
  if (largerDimension < maxMeters) {
    return 16;
  }
  if (largerDimension < maxMeters*2) {
    return 15;
  }  
  if (largerDimension < maxMeters*4) {
    return 14;
  } 
  if (largerDimension < maxMeters*8) {
    return 13;
  }
  if (largerDimension < maxMeters*16) {
    return 12;
  }
  if (largerDimension < maxMeters*32) {
    return 11;
  }
  return 10;
}