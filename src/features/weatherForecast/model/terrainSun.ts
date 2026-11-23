import { type Loaded, useCached } from '@shared/hooks/useCached.js';
import { TerrainCreditsSchema } from '@shared/terrainService.js';
import type { LatLon } from '@shared/types/common.js';
import z from 'zod';
import { type Forecast, forecastDays } from './forecast.js';
import { zonedDayStart } from './timeZone.js';

/** First rise and last set over the skyline; null where there is none or it can't tell. */
export type TerrainSunDay = {
  sunrise: Date | null;
  sunset: Date | null;
  /** The terrain hides the sun all day. */
  hidden: boolean;
};

export type TerrainSun = {
  days: Map<string, TerrainSunDay>;
  credits: z.output<typeof TerrainCreditsSchema>;
};

const time = z
  .number()
  .nullable()
  .transform((t) => (t === null ? null : new Date(t)));

const SunSchema = z.object({
  days: z.array(z.object({ rise: time, set: time, hidden: z.boolean() })),
  sources: TerrainCreditsSchema,
});

/** The forecast's day keys and the edges of those days, by the place's clock. */
function dayEdges(forecast: Forecast): { keys: string[]; edges: number[] } {
  const days = forecastDays(forecast);

  const last = days.at(-1);

  return {
    keys: days.map((d) => d.key),
    edges: last
      ? [
          ...days.map((d) => d.date.getTime()),
          // The next midnight there, 23 to 25 hours on, across DST.
          zonedDayStart(
            new Date(last.date.getTime() + 36 * 3_600_000),
            forecast.timeZone,
          ).getTime(),
        ]
      : [],
  };
}

async function fetchSun(
  point: LatLon,
  keys: string[],
  edges: number[],
): Promise<TerrainSun> {
  const params = new URLSearchParams({
    lat: point.lat.toFixed(5),
    lon: point.lon.toFixed(5),
    days: edges.join(','),
  });

  const res = await fetch(`${process.env['TERRAIN_URL']}/sun?${params}`);

  if (!res.ok) {
    throw new Error(`sun: ${res.status}`);
  }

  const { days, sources } = SunSchema.parse(await res.json());

  return {
    days: new Map(
      keys.flatMap((key, i) => {
        const day = days[i];

        return day
          ? [[key, { sunrise: day.rise, sunset: day.set, hidden: day.hidden }]]
          : [];
      }),
    ),
    credits: sources,
  };
}

/** Sunrise and sunset over the terrain at `point`, for the forecast's days; idle without one. */
export function useTerrainSun(
  point: LatLon,
  forecast: Forecast | null,
): Loaded<TerrainSun> {
  const { keys, edges } = forecast
    ? dayEdges(forecast)
    : { keys: [], edges: [] };

  // TODO a refreshed forecast with new day edges shows level times until this answers again.
  const key = edges.length
    ? `${point.lat.toFixed(5)},${point.lon.toFixed(5)}|${edges.join(',')}`
    : null;

  return useCached(key, () => fetchSun(point, keys, edges));
}
