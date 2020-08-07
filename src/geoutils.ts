import { LatLngLiteral } from 'leaflet';
import { LatLon } from './types/common';
import { Feature } from 'geojson';

const PI2 = 2 * Math.PI;

export type GpsCoordStyle = 'DMS' | 'DM' | 'D';

export function formatGpsCoord(
  angle: number,
  cardinals: string,
  style: GpsCoordStyle = 'DMS',
  language: string,
): string {
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
      const seconds = Intl.NumberFormat(language, {
        minimumFractionDigits: 3,
        maximumFractionDigits: 3,
      }).format((a - degrees - minutes / 60) * 3600);
      return `${cardinal}${degrees}°\xa0${minutes}'\xa0${seconds}"`;
    }
    case 'DM': {
      const degrees = Math.floor(a);
      const minutes = Intl.NumberFormat(language, {
        minimumFractionDigits: 4,
        maximumFractionDigits: 4,
      }).format((a - degrees) * 60);
      return `${cardinal}${degrees}°\xa0${minutes}'`;
    }
    case 'D': {
      return `${cardinal}${Intl.NumberFormat(language, {
        minimumFractionDigits: 6,
        maximumFractionDigits: 6,
      }).format(a)}°`;
    }
    default: {
      throw new Error('unknown GPS coords style');
    }
  }
}

// distance in meters
export function distance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const a =
    0.5 -
    Math.cos(toRad(lat2 - lat1)) / 2 +
    (Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      (1 - Math.cos(toRad(lon2 - lon1)))) /
      2;
  return 12742000 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
}

export function bearing(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const dLon = lon2 - lon1;
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  return PI2 - ((Math.atan2(y, x) + PI2) % PI2);
}

export function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function getCurrentPosition(): Promise<LatLon> {
  return new Promise((resolve, reject) => {
    const onSuccess = (pos: Position) => {
      resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude });
    };

    const onError = (error: PositionError) => {
      reject(error);
    };

    navigator.geolocation.getCurrentPosition(onSuccess, onError, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    });
  });
}

export function containsElevations(geojson: Feature): boolean {
  return (
    geojson.geometry.type === 'LineString' &&
    geojson.geometry.coordinates[0].length === 3
  );
}

// returns array of [lat, lon, smoothedEle] triplets
export function smoothElevations(
  coords: number[][],
  eleSmoothingFactor: number,
): number[][] {
  let prevFloatingWindowEle = 0;
  return coords.map((lonLatEle, i) => {
    const floatingWindow = coords
      .slice(i, i + eleSmoothingFactor)
      .filter((e) => e)
      .sort();
    let floatingWindowWithoutExtremes = floatingWindow;
    if (eleSmoothingFactor >= 5) {
      // ignore highest and smallest value
      floatingWindowWithoutExtremes = floatingWindow.splice(
        1,
        floatingWindow.length - 2,
      );
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
    return [lonLatEle[0], lonLatEle[1], flotingWindowEle];
  });
}

export function toLatLng({ lat, lon }: LatLon): LatLngLiteral {
  return { lat, lng: lon };
}

export function toLatLngArr(arr: LatLon[]): LatLngLiteral[] {
  return arr.map(toLatLng);
}

export function latLonToString(
  latLon: LatLon,
  language: string,
  style: GpsCoordStyle = 'DMS',
): string {
  return `${formatGpsCoord(
    latLon.lat,
    'SN',
    style,
    language,
  )}, ${formatGpsCoord(latLon.lon, 'WE', style, language)}`;
}
