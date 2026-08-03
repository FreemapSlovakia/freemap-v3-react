import z from 'zod';

/** The layer id the weather radar overlay is registered under. */
export const RADAR_LAYER = 'R';

/**
 * LibreWXR origin. Everything — metadata and tiles alike — is addressed through
 * it rather than through the `host` the metadata reports, so pointing this at a
 * caching reverse proxy of ours moves the whole layer behind it in one step.
 */
export const LIBREWXR_URL = process.env['LIBREWXR_URL']!;

const FrameSchema = z.object({
  /** Unix second the composite is valid for. */
  time: z.number(),
  /** Tile path prefix, to be completed with size/z/x/y/color/flags. */
  path: z.string(),
});

const ColorSchemeSchema = z.object({
  id: z.number(),
  /** Product name of the scheme; not translated, as each names a source. */
  name: z.string(),
});

/** The RainViewer-v2-compatible metadata document, narrowed to the radar half. */
export const WeatherMapsSchema = z.object({
  generated: z.number(),
  radar: z.object({
    past: z.array(FrameSchema).default([]),
    nowcast: z.array(FrameSchema).default([]),
    colorSchemes: z.array(ColorSchemeSchema).default([]),
  }),
});

export type ColorScheme = z.infer<typeof ColorSchemeSchema>;

/** One frame of the animation, observed composite or model nowcast. */
export type RadarFrame = {
  time: number;
  path: string;
  /** A nowcast (extrapolated forward) rather than an observed composite. */
  forecast: boolean;
};

export type RadarTileOptions = {
  colorScheme: number;
  smooth: boolean;
  snow: boolean;
  /**
   * Pixels the server renders the tile at. The same `z/x/y` covers the same
   * ground either way, so 512 is simply the @2x version — what a HiDPI screen
   * needs to avoid displaying every tile stretched.
   */
  size: 256 | 512;
};

/**
 * Leaflet URL template for one frame. WebP because a radar tile halves in size
 * against the PNG of the same frame, and the animation fetches a tile per frame.
 *
 * `version` is appended for frames whose content changes under a fixed URL —
 * the forecast half, re-computed from newer radar each cycle. Without it the
 * browser answers the re-fetch from its own five-minute cache and the new
 * forecast is invisible for up to that long. Observed frames pass no version:
 * they never change, and churning their URLs would re-render six hours of
 * history every cycle.
 */
export function radarTileUrl(
  path: string,
  { colorScheme, smooth, snow, size }: RadarTileOptions,
  version?: number,
): string {
  return (
    `${LIBREWXR_URL}${path}/${size}/{z}/{x}/{y}/${colorScheme}/${smooth ? 1 : 0}_${snow ? 1 : 0}.webp` +
    (version === undefined ? '' : `?v=${version}`)
  );
}

/** Merges the two frame lists into the single timeline the UI animates. */
export function toFrames({
  past,
  nowcast,
}: z.infer<typeof WeatherMapsSchema>['radar']): RadarFrame[] {
  return [
    ...past.map((f) => ({ ...f, forecast: false })),
    ...nowcast.map((f) => ({ ...f, forecast: true })),
  ];
}
