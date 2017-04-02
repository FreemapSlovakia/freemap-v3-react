import geojsonArea from '@mapbox/geojson-area';
import turfLineSlice from '@turf/line-slice';

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
      throw new Error();
    }
  }
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

export function getCurrentPosition() {
  const options = {
    enableHighAccuracy: true,
    timeout: 2000,
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
  const geometry = {
    type: 'Polygon',
    coordinates: [[...points, points[0]].map(({ lat, lon }) => [lon, lat])],
  };
  return geojsonArea.geometry(geometry);
}

export function sliceToGeojsonPoylines(polylineLatLons, splitPoints) {
  const line = {
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates: polylineLatLons.map(latlon => [latlon[1], latlon[0]]),
    },
  };
  const geojsonPoints = splitPoints.map((p) => {
    const h = {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [p.lon, p.lat] },
    };
    return h;
  });

  const slices = [];
  for (let i = 0; i < geojsonPoints.length - 1; i += 1) {
    const p1 = geojsonPoints[i];
    const p2 = geojsonPoints[i + 1];
    const s = turfLineSlice(p1, p2, line);
    slices.push(s);
  }

  return slices;
}

