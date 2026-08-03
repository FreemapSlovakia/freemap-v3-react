export type WeatherRadarMessages = {
  play: string;
  pause: string;
  previousFrame: string;
  nextFrame: string;
  /** Accessible name of the frame slider. */
  timeline: string;
  /** Placeholder shown until the first frame list arrives. */
  loading: string;
  /** The newest observed frame. */
  now: string;
  /** `duration` arrives already localized — "5h 54m", "5 h, 54 min". */
  ago: (props: { duration: string }) => string;
  ahead: (props: { duration: string }) => string;
  /** Marks the frames extrapolated past "now" rather than measured. */
  forecast: string;
  settings: string;
  colorScheme: string;
  /** Interpolates between reflectivity steps instead of drawing them as bands. */
  smooth: string;
  snow: string;
  showNowcast: string;
};
