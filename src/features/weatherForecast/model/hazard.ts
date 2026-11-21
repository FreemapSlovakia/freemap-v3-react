import { clamp } from '@shared/mathUtils.js';
import { KMH_PER_MS } from './forecast.js';

/** km/h where a gust starts to take colour, is fully amber, is dangerous and is red. */
const GUST_KMH = { grey: 45, amber: 60, dangerous: 90, red: 100 };

type GustScale = {
  /** 0 grey to 1 fully coloured. */
  colour: number;
  /** 0 amber to 1 red. */
  red: number;
  dangerous: boolean;
};

/** A gust's place on the scale, null below where it takes any colour. */
export function gustScale(gust: number | null): GustScale | null {
  const kmh = (gust ?? 0) * KMH_PER_MS;

  if (kmh < GUST_KMH.grey) {
    return null;
  }

  const between = (from: number, to: number) =>
    clamp((kmh - from) / (to - from), 0, 1);

  return {
    colour: between(GUST_KMH.grey, GUST_KMH.amber),
    red: between(GUST_KMH.amber, GUST_KMH.red),
    dangerous: kmh >= GUST_KMH.dangerous,
  };
}

export type Hazard = 'warning' | 'danger';

export type ThunderLevel = 'low' | 'moderate' | 'high';

/** J/kg of CAPE from which thunderstorms can grow, and grow strong. */
export function thunderLevel(cape: number | null): ThunderLevel | null {
  if (cape === null || cape < 300) {
    return null;
  }

  return cape < 1000 ? 'low' : cape < 2500 ? 'moderate' : 'high';
}

export function thunderHazard(level: ThunderLevel | null): Hazard | null {
  return level === 'high' ? 'danger' : level === 'moderate' ? 'warning' : null;
}
