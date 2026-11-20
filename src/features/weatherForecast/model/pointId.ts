import type { LatLon } from '@shared/types/common.js';

/** A point as the `weather` selection and `panel=weather/…` name it. */
export function weatherPointId({ lat, lon }: LatLon): string {
  // A click on a world copy east or west of the first one lies past ±180.
  // TODO the marker and the panel's pan then go to the first copy.
  const wrapped = ((((lon + 180) % 360) + 360) % 360) - 180;

  return `${lat.toFixed(4)},${wrapped.toFixed(4)}`;
}

export function parseWeatherPointId(id: string): LatLon | undefined {
  const m = /^(-?\d{1,2}(?:\.\d+)?),(-?\d{1,3}(?:\.\d+)?)$/.exec(id);

  if (!m) {
    return undefined;
  }

  const lat = Number(m[1]);

  const lon = Number(m[2]);

  return Math.abs(lat) <= 90 && Math.abs(lon) <= 180 ? { lat, lon } : undefined;
}
