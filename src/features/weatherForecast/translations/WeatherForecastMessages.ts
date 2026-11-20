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
  /** After the wind speed: "gusts 54 km/h". */
  gusts: string;
  alongRoute: string;
  departure: string;
  start: string;
  highest: string;
  finish: string;
  /** A point between, by its distance from the start: "After 20 km". */
  along: (props: { distance: string }) => string;
  /** Reached later than the forecast reaches. */
  beyond: string;
  /** Premium upsell. */
  locked: string;
  noRoute: string;
  /** The departure is so early that the whole route is over. */
  past: string;
};
