import geojsonArea from '@mapbox/geojson-area';

const PI2 = 2 * Math.PI;

const nf3 = Intl.NumberFormat('sk', { minimumFractionDigits: 3, maximumFractionDigits: 3 });
const nf4 = Intl.NumberFormat('sk', { minimumFractionDigits: 4, maximumFractionDigits: 4 });
const nf6 = Intl.NumberFormat('sk', { minimumFractionDigits: 6, maximumFractionDigits: 6 });

export function formatGpsCoord(angle, cardinals, style = 'DMS') {
  let cardinal = '';
  let a = angle;
  if (cardinals) {
    cardinal = `${cardinals[angle < 0 ? 0 : 1]} `;
    a = Math.abs(angle);
  }

  switch (style) {
    case 'DMS': {
      const degrees = Math.floor(a);
      const minutes = Math.floor((a - degrees) * 60);
      const seconds = nf3.format((a - degrees - minutes / 60) * 3600);
      return `${cardinal}${degrees}° ${minutes}' ${seconds}"`;
    }
    case 'DM': {
      const degrees = Math.floor(a);
      const minutes = nf4.format((a - degrees) * 60);
      return `${cardinal}${degrees}° ${minutes}'`;
    }
    case 'D': {
      return `${cardinal}${nf6.format(a)}°`;
    }
    default: {
      throw new Error('unknown GPS coords style');
    }
  }
}

// distance in meters
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

export function getCurrentPosition() {
  const options = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0,
  };

  return new Promise((resolve, reject) => {
    // resolve({ lat: 48.786170, lon: 19.496098 });
    const onSuccess = (pos) => {
      resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude });
    };

    const onError = (error) => {
      reject(error);
    };

    navigator.geolocation.getCurrentPosition(onSuccess, onError, options);
  });
}

export function area(points) {
  return geojsonArea.geometry({
    type: 'Polygon',
    coordinates: [[...points, points[0]].map(({ lat, lon }) => [lon, lat])],
  });
}

export function containsElevations(geojson) {
  return geojson.geometry.coordinates[0].length === 3;
}

// returns array of [lat, lon, smoothedEle] triplets
export function smoothElevations(geojson, eleSmoothingFactor) {
  const coords = geojson.geometry.coordinates;
  let prevFloatingWindowEle = 0;
  return coords.map((lonLatEle, i) => {
    const floatingWindow = coords.slice(i, i + eleSmoothingFactor).filter(e => e).sort();
    let floatingWindowWithoutExtremes = floatingWindow;
    if (eleSmoothingFactor >= 5) { // ignore highest and smallest value
      floatingWindowWithoutExtremes = floatingWindow.splice(1, floatingWindow.length - 2);
    }

    let eleSum = 0;
    floatingWindowWithoutExtremes.forEach((lle) => {
      eleSum += lle[2];
    });

    let flotingWindowEle = eleSum / floatingWindowWithoutExtremes.length;
    if (Number.isNaN(flotingWindowEle)) {
      flotingWindowEle = prevFloatingWindowEle;
    }
    prevFloatingWindowEle = flotingWindowEle;
    return [lonLatEle[1], lonLatEle[0], flotingWindowEle];
  });
}
