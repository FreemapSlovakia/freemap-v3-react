import type { ThunderLevel } from '../model/hazard.js';

export type WeatherForecastMessages = {
  title: string;
  loading: string;
  failed: string;
  /** The terrain height the temperatures are adjusted to. */
  elevation: (props: { elevation: string }) => string;
  /** When the provider computed the forecast. */
  updated: (props: { time: string }) => string;
  /** Before the provider's name. */
  source: string;
  /** Under the wind speed: "gusts 54 km/h". */
  gusts: string;
  alongRoute: string;
  start: string;
  highest: string;
  finish: string;
  /** A point between, by its distance from the start: "After 20 km". */
  along: (props: { distance: string }) => string;
  /** Reached later than the forecast reaches. */
  beyond: string;
  /** Premium upsell. */
  noRoute: string;
  /** The departure is so early that the whole route is over. */
  past: string;
  /** A stop on the route, its row's kind. */
  pause: string;
  overnight: string;
  /** While the forecast's place is picked on the map. */
  pickPrompt: string;
  otherPlace: string;
  /** The place lies outside the forecast's region. */
  outside: string;
  /** An hour's details, joined by " · ". */
  feelsLike: (props: { temperature: string }) => string;
  /** Snow on the ground: "35 cm of snow". */
  snowDepth: (props: { depth: string }) => string;
  /** From which height it falls as snow, metres above sea level. */
  snowLine: (props: { elevation: string }) => string;
  /** Relative humidity. */
  humidity: (props: { value: string }) => string;
  /** Where the temperature falls to 0 °C, metres above sea level. */
  freezingLevel: (props: { elevation: string }) => string;
  /** Cloud cover by height: below 3 km, 3–8 km, above 8 km. */
  clouds: (props: { low: string; mid: string; high: string }) => string;
  thunderRisk: (props: { level: string }) => string;
  thunderLevels: Record<ThunderLevel, string>;
  /** Minutes of sunshine in the hour. */
  sunshine: (props: { duration: string }) => string;
  uvIndex: (props: { index: string }) => string;
  /** An open day's first line: the day's strongest gusts. */
  gustsMax: (props: { speed: string }) => string;
  /** How many hours of the day it rains or snows. */
  wetHours: (props: { hours: string }) => string;
  /** After `wetHours` and a comma: the day's highest chance of precipitation. */
  chanceMax: (props: { probability: string }) => string;
  visibility: (props: { distance: string }) => string;
};
