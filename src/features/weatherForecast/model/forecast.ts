import type { Loaded } from '@shared/hooks/useCached.js';
import { useCached } from '@shared/hooks/useCached.js';
import { IsoDateSchema, type LatLon } from '@shared/types/common.js';
import z from 'zod';
import {
  isKnownZone,
  zonedDayKey,
  zonedDayStart,
  zonedHour,
} from './timeZone.js';

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

// Absent from a forecast the browser cached before the API had it.
const optional = z.number().nullable().default(null);

const ForecastStepSchema = z.object({
  time: IsoDateSchema,
  /** How long `weather` and `precipitation` last from `time`. */
  hours: z.number(),
  temperature: z.number(),
  apparentTemperature: optional,
  /** m/s */
  windSpeed: z.number(),
  windGust: z.number().nullable(),
  /** Where the wind blows from, in degrees. */
  windDirection: z.number().nullable(),
  /** % */
  cloudCoverLow: optional,
  cloudCoverMid: optional,
  cloudCoverHigh: optional,
  precipitation: z.number(),
  precipitationProbability: z.number().nullable(),
  /** mm of rain over the step. */
  rain: optional,
  /** cm of fresh snow over the step. */
  snowfall: optional,
  /** cm on the ground. */
  snowDepth: optional,
  /** Metres above sea level of 0 °C. */
  freezingLevel: optional,
  /** J/kg, the energy for thunderstorms. */
  cape: optional,
  /** Minutes over the step. */
  sunshine: optional,
  uvIndex: optional,
  /** Metres. */
  visibility: optional,
  /** Metres above sea level from which it falls as snow. */
  snowLine: optional,
  /** % */
  humidity: optional,
  weather: WeatherSchema,
});

export type ForecastStep = z.infer<typeof ForecastStepSchema>;

const ForecastSchema = z.object({
  updatedAt: IsoDateSchema,
  elevation: z.number().nullable(),
  steps: ForecastStepSchema.array(),
  sun: z
    .object({
      sunrise: IsoDateSchema.nullable(),
      sunset: IsoDateSchema.nullable(),
    })
    .array()
    .default([]),
  /**
   * The place's IANA zone, which its days and times are shown in; null where
   * missing or unknown to the browser.
   */
  timeZone: z.string().refine(isKnownZone).nullable().catch(null),
  attribution: z.object({ name: z.string(), url: z.string() }),
});

export type Forecast = z.infer<typeof ForecastSchema>;

/** Whole degrees; `+ 0` makes the -0 a value just below zero rounds to plain 0. */
export function formatTemperature(
  format: Intl.NumberFormat,
  t: number,
): string {
  return format.format(Math.round(t) + 0);
}

/** About as far ahead as the forecast reaches. */
export const FORECAST_DAYS = 16;

export const KMH_PER_MS = 3.6;

/** The least precipitation, in mm or cm, that counts: it reads as 0.1. */
export const MIN_AMOUNT = 0.05;

/**
 * Whether anything falls in a step, by the amounts shown: snow, rain, or the
 * total where the forecast doesn't split it.
 */
export function isWet(
  s: Pick<ForecastStep, 'rain' | 'snowfall' | 'precipitation'>,
): boolean {
  return s.rain === null && s.snowfall === null
    ? s.precipitation >= MIN_AMOUNT
    : (s.rain ?? 0) >= MIN_AMOUNT || (s.snowfall ?? 0) >= MIN_AMOUNT;
}

/** The least snow on the ground, in cm, worth saying. */
export const MIN_SNOW_DEPTH = 1;

/** The values' sum, null where no value is known. */
export function sumKnown(values: (number | null)[]): number | null {
  const known = values.filter((v) => v !== null);

  return known.length ? known.reduce((a, b) => a + b, 0) : null;
}

/** The values' maximum, null where no value is known. */
export function maxKnown(values: (number | null)[]): number | null {
  const known = values.filter((v) => v !== null);

  return known.length ? Math.max(...known) : null;
}

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

  // Outside Europe, as the API words it: a forecast with no steps. Any other
  // 404 is a failure.
  if (res.status === 404 && (await res.text()).includes('outside Europe')) {
    return {
      updatedAt: new Date(),
      elevation: null,
      steps: [],
      sun: [],
      timeZone: null,
      attribution: { name: '', url: '' },
    };
  }

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
  /** `YYYY-MM-DD`, in the place's time zone. */
  key: string;
  /** The midnight it starts with there. */
  date: Date;
  steps: ForecastStep[];
  min: number;
  max: number;
  precipitation: number;
  /** mm of rain, if the provider says. */
  rain: number | null;
  /** cm of fresh snow, if the provider says. */
  snowfall: number | null;
  /** The deepest cm of snow on the ground, if the provider says. */
  snowDepth: number | null;
  /** Null in a polar day or night, or from a provider without them. */
  sunrise: Date | null;
  sunset: Date | null;
  /** Its daytime's weather, by `daySymbol`. */
  weather: Weather;
};

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

/**
 * A day's symbol from its hours' weather: thunder if any hour has it; else
 * the most common dry sky, with showers where precipitation falls in at most
 * a quarter of the hours under a mostly sunny sky; else the worst precipitation.
 */
export function daySymbol(hours: Weather[]): Weather {
  const worst = hours.reduce((a, b) => (severity(b) > severity(a) ? b : a));

  const dry = hours.filter((w) => !w.precipitation);

  const wet = hours.length - dry.length;

  if (worst.thunder || dry.length === 0) {
    return worst;
  }

  // A tie goes to the cloudier sky.
  const [sky] = [...Map.groupBy(dry, (w) => w.sky)].reduce((a, b) =>
    b[1].length > a[1].length ||
    (b[1].length === a[1].length && SKY_SEVERITY[b[0]] > SKY_SEVERITY[a[0]])
      ? b
      : a,
  );

  if (!worst.precipitation) {
    return { sky, precipitation: null, thunder: false, day: true };
  }

  return wet * 4 <= hours.length && SKY_SEVERITY[sky] < SKY_SEVERITY.cloudy
    ? {
        sky,
        precipitation: { ...worst.precipitation, showers: true },
        thunder: false,
        day: true,
      }
    : worst;
}

/**
 * A stretch of the forecast as one step: the worst weather, the lowest
 * temperature, the strongest wind and the precipitation over its steps.
 */
export function spanStep(
  steps: ForecastStep[],
  from: number,
  to: number,
): ForecastStep | undefined {
  const span = steps.filter((s) => s.time.getTime() < to && stepEnd(s) > from);

  const first = span[0];

  if (!first) {
    return undefined;
  }

  const pick = (better: (a: ForecastStep, b: ForecastStep) => boolean) =>
    span.reduce((best, s) => (better(s, best) ? s : best));

  const windiest = pick((a, b) => a.windSpeed > b.windSpeed);

  // Each step's in proportion to the part of it the stretch covers.
  const total = (value: (s: ForecastStep) => number | null) =>
    span.reduce((sum, s) => {
      const start = s.time.getTime();

      const covered = Math.min(to, stepEnd(s)) - Math.max(from, start);

      return sum + ((value(s) ?? 0) * covered) / (stepEnd(s) - start);
    }, 0);

  return {
    ...first,
    hours: (to - from) / 3_600_000,
    temperature: pick((a, b) => a.temperature < b.temperature).temperature,
    windSpeed: windiest.windSpeed,
    // The strongest gust, which needn't come with the strongest wind.
    windGust: maxKnown(span.map((s) => s.windGust)),
    windDirection: windiest.windDirection,
    precipitation: total((s) => s.precipitation),
    rain: span.every((s) => s.rain === null) ? null : total((s) => s.rain),
    snowfall: span.every((s) => s.snowfall === null)
      ? null
      : total((s) => s.snowfall),
    weather: pick((a, b) => severity(a.weather) > severity(b.weather)).weather,
  };
}

/**
 * The steps by the place's day (`timeZone`, or the browser's where null); a
 * day's symbol is that of its hours from 6:00 to 21:00 there.
 */
export function forecastDays({
  steps,
  sun,
  timeZone,
}: Pick<Forecast, 'steps' | 'sun' | 'timeZone'>): ForecastDay[] {
  const byDay = Map.groupBy(steps, (step) => zonedDayKey(step.time, timeZone));

  // Each by the day it falls on there, not by the UTC day it is listed by.
  const byDayThere = (times: (Date | null)[]) =>
    new Map(
      times.flatMap((t) => (t ? [[zonedDayKey(t, timeZone), t] as const] : [])),
    );

  const sunrises = byDayThere(sun.map((s) => s.sunrise));

  const sunsets = byDayThere(sun.map((s) => s.sunset));

  return [...byDay].map(([key, daySteps]) => {
    const daytime = daySteps.filter((s) => {
      const hour = zonedHour(s.time, timeZone);

      return hour >= 6 && hour < 21;
    });

    const first = daySteps[0]!;

    return {
      key,
      date: zonedDayStart(first.time, timeZone),
      steps: daySteps,
      min: Math.min(...daySteps.map((s) => s.temperature)),
      max: Math.max(...daySteps.map((s) => s.temperature)),
      precipitation: daySteps.reduce((sum, s) => sum + s.precipitation, 0),
      rain: sumKnown(daySteps.map((s) => s.rain)),
      snowfall: sumKnown(daySteps.map((s) => s.snowfall)),
      snowDepth: maxKnown(daySteps.map((s) => s.snowDepth)),
      sunrise: sunrises.get(key) ?? null,
      sunset: sunsets.get(key) ?? null,
      weather: daySymbol(
        (daytime.length ? daytime : daySteps).map((s) => s.weather),
      ),
    };
  });
}
