import z from 'zod';

/** The layer id the weather radar overlay is registered under. */
export const RADAR_LAYER = 'R';

/**
 * Origin for both feeds — the upstream itself; nothing of ours sits in front.
 * It authenticates by `Referer` and sends CORS for our origins, which is why
 * every request here has to set its own `referrerPolicy`: the app is served
 * with `Referrer-Policy: no-referrer`, so a request that doesn't override it
 * carries no Referer and comes back 401.
 */
export const WEATHER_RADAR_URL = process.env['WEATHER_RADAR_URL']!;

/**
 * The two feeds are separate services with separate status documents, separate
 * regeneration cycles and — this is the part that reaches the layer — separate
 * zoom ranges. The forecast is the more expensive to compute, so it is served
 * over a narrower band.
 */
export const RADAR_FEEDS = ['radar', 'forecast'] as const;

export type RadarFeed = (typeof RADAR_FEEDS)[number];

export const FeedStatusSchema = z.object({
  /** When the feed was last regenerated — stable between requests. */
  updatedAt: z.string(),
  zoomLevels: z.array(z.number()).nonempty(),
  /** `png` today, `webp` once enough clients have updated. */
  format: z.string(),
  /** Unix seconds, delivered as strings. */
  times: z.array(z.coerce.number()),
});

export type FeedStatus = z.infer<typeof FeedStatusSchema>;

/** What the layer needs from a feed to build a URL and bound its requests. */
export type FeedInfo = {
  format: string;
  minZoom: number;
  maxZoom: number;
  updatedAt: string;
};

export function toFeedInfo({
  format,
  zoomLevels,
  updatedAt,
}: FeedStatus): FeedInfo {
  return {
    format,
    minZoom: Math.min(...zoomLevels),
    maxZoom: Math.max(...zoomLevels),
    updatedAt,
  };
}

/** One frame of the animation, measured or extrapolated. */
export type RadarFrame = {
  time: number;
  /** A forecast, and so from the `forecast` feed rather than `radar`. */
  forecast: boolean;
};

export const feedOf = (frame: RadarFrame): RadarFeed =>
  frame.forecast ? 'forecast' : 'radar';

/**
 * Leaflet URL template for one frame. The tiles are 512×512 on the standard
 * slippy grid — a @2x render of the tile, so Leaflet displays them at its usual
 * 256 CSS px. There is no size parameter, so a 1x screen pays for pixels it
 * cannot use; nothing to be done about that from here.
 *
 * `version` is appended for the forecast, whose frames are recomputed under a
 * fixed URL each cycle — without it the browser answers a re-fetch from its own
 * cache and the new forecast stays invisible. The measured frames pass none:
 * they never change, and churning their URLs would refetch the whole history.
 */
export function radarTileUrl(
  frame: RadarFrame,
  { format }: FeedInfo,
  version?: string,
): string {
  return (
    `${WEATHER_RADAR_URL}/${feedOf(frame)}/tiles/${frame.time}/{z}/{x}/{y}.${format}` +
    (version === undefined ? '' : `?v=${encodeURIComponent(version)}`)
  );
}

/**
 * Merges the two feeds into the single timeline the UI animates.
 *
 * Forecast frames at or before the newest measured one are dropped. They are
 * worthless on their own terms — a prediction for a moment we have since
 * observed — and the feeds regenerate on independent cycles, so a measured feed
 * running ahead of a stale forecast would otherwise interleave them. That would
 * put forecast frames inside the measured stretch, where the timeline paints
 * them wrongly and, worse, a non-premium user could open them.
 */
export function toFrames(
  radar: FeedStatus | undefined,
  forecast: FeedStatus | undefined,
): RadarFrame[] {
  const measured = (radar?.times ?? []).map((time) => ({
    time,
    forecast: false,
  }));

  const newest = measured.reduce((a, f) => Math.max(a, f.time), -Infinity);

  return [
    ...measured,
    ...(forecast?.times ?? [])
      .filter((time) => time > newest)
      .map((time) => ({ time, forecast: true })),
  ].sort((a, b) => a.time - b.time);
}
