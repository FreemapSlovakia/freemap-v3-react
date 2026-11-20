import type { Loaded } from '@shared/hooks/useCached.js';
import { useCached } from '@shared/hooks/useCached.js';
import { IsoDateSchema, type LatLon } from '@shared/types/common.js';
import z from 'zod';

const WeatherSchema = z.object({
  sky: z.enum(['clear', 'fair', 'partlyCloudy', 'cloudy', 'fog']),
  precipitation: z
    .object({
      type: z.enum(['rain', 'sleet', 'snow']),
      intensity: z.enum(['light', 'moderate', 'heavy']),
      showers: z.boolean(),
    })
    .nullable(),
  thunder: z.boolean(),
  day: z.boolean(),
});

export type Weather = z.infer<typeof WeatherSchema>;

const ForecastStepSchema = z.object({
  time: IsoDateSchema,
  /** How long `weather` and `precipitation` last from `time`. */
  hours: z.number(),
  temperature: z.number(),
  /** m/s */
  windSpeed: z.number(),
  windGust: z.number().nullable(),
  /** Where the wind blows from, in degrees. */
  windDirection: z.number().nullable(),
  precipitation: z.number(),
  precipitationProbability: z.number().nullable(),
  weather: WeatherSchema,
});

export type ForecastStep = z.infer<typeof ForecastStepSchema>;

const ForecastSchema = z.object({
  updatedAt: IsoDateSchema,
  elevation: z.number().nullable(),
  steps: ForecastStepSchema.array(),
  attribution: z.object({ name: z.string(), url: z.string() }),
});

export type Forecast = z.infer<typeof ForecastSchema>;

/** About as far ahead as the forecast reaches. */
export const FORECAST_DAYS = 9;

export function stepEnd(step: ForecastStep): number {
  return step.time.getTime() + step.hours * 3_600_000;
}

/** The step whose period holds `t`; a gap between steps goes to the earlier. */
export function stepAt(
  steps: ForecastStep[],
  t: number,
): ForecastStep | undefined {
  const first = steps[0];

  const last = steps.at(-1);

  return first && last && t >= first.time.getTime() && t < stepEnd(last)
    ? steps.findLast((s) => s.time.getTime() <= t)
    : undefined;
}

/** Requests on their way, so rows naming one point at once ask once. */
const inFlight = new Map<string, Promise<Forecast>>();

function fetchForecast(key: string): Promise<Forecast> {
  let promise = inFlight.get(key);

  if (!promise) {
    promise = requestForecast(key).finally(() => {
      inFlight.delete(key);
    });

    inFlight.set(key, promise);
  }

  return promise;
}

async function requestForecast(key: string): Promise<Forecast> {
  const [lat, lon] = key.split(',');

  const res = await fetch(
    `${process.env['API_URL']}/weather/forecast?lat=${lat}&lon=${lon}`,
    { headers: { accept: 'application/json' } },
  );

  if (!res.ok) {
    throw new Error(`weather forecast: ${res.status}`);
  }

  return ForecastSchema.parse(await res.json());
}

/**
 * The forecast for `point`, idle while it is null. Asked for at the API's own
 * 3-decimal rounding, so the browser's HTTP cache serves points nearby.
 */
export function useForecast(
  point: LatLon | null | undefined,
): Loaded<Forecast> {
  const key = point ? `${point.lat.toFixed(3)},${point.lon.toFixed(3)}` : null;

  // Not kept here: the HTTP cache knows when the forecast goes stale.
  return useCached(key, () => fetchForecast(key!), false);
}

export type ForecastDay = {
  /** `YYYY-MM-DD`, in local time. */
  key: string;
  date: Date;
  steps: ForecastStep[];
  min: number;
  max: number;
  precipitation: number;
  windMax: number;
  /** The worst of its daytime weather. */
  weather: Weather;
};

export function dayKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

const SKY_SEVERITY: Record<Weather['sky'], number> = {
  clear: 0,
  fair: 1,
  partlyCloudy: 2,
  cloudy: 3,
  fog: 4,
};

const INTENSITY_SEVERITY = { light: 0, moderate: 10, heavy: 20 };

function severity(w: Weather): number {
  if (w.thunder) {
    return 100;
  }

  if (w.precipitation) {
    return 50 + INTENSITY_SEVERITY[w.precipitation.intensity];
  }

  return SKY_SEVERITY[w.sky];
}

/** The steps by local day; a day's symbol is the worst of 6:00 to 21:00. */
export function forecastDays(steps: ForecastStep[]): ForecastDay[] {
  const byDay = Map.groupBy(steps, (step) => dayKey(step.time));

  return [...byDay].map(([key, daySteps]) => {
    const daytime = daySteps.filter((s) => {
      const hour = s.time.getHours();

      return hour >= 6 && hour < 21;
    });

    const first = daySteps[0]!;

    return {
      key,
      date: new Date(
        first.time.getFullYear(),
        first.time.getMonth(),
        first.time.getDate(),
      ),
      steps: daySteps,
      min: Math.min(...daySteps.map((s) => s.temperature)),
      max: Math.max(...daySteps.map((s) => s.temperature)),
      precipitation: daySteps.reduce((sum, s) => sum + s.precipitation, 0),
      windMax: Math.max(...daySteps.map((s) => s.windSpeed)),
      weather: (daytime.length ? daytime : daySteps).reduce((worst, s) =>
        severity(s.weather) > severity(worst.weather) ? s : worst,
      ).weather,
    };
  });
}
