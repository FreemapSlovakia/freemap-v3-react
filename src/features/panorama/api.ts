import { HttpError, httpRequest, isNetworkError } from '@app/httpRequest.js';
import type { RootState } from '@app/store/store.js';
import type { CancelTriggers } from '@shared/cancelRegister.js';
import z from 'zod';
import { decodeDepth, type PanoramaDepth } from './depth.js';

/**
 * What the terrain service is asked for. Field names are the wire's, so the
 * request object goes out as-is — see `doc/panorama.md` and the service's own
 * `docs/API.md`.
 */
export interface PanoramaRequest {
  lon: number;
  lat: number;
  /** Azimuth of the left edge. A full turn starts wherever we like. */
  az?: number;
  fov?: number;
  alt_min: number;
  alt_max: number;
  step: number;
  eye: number;
  /**
   * Metres around the viewpoint the eye is raised to the highest ground in,
   * 0–200. The pyramid stores a 6 m average, which costs a summit more the
   * sharper it is, so the raw value at a peak sits below where a person would
   * stand and puts the rock they are on above their eye. `0` disables it.
   */
  eye_search_radius?: number;
  /** Farthest terrain considered, metres, 1 000–400 000. */
  range?: number;
  supersample_x: number;
  supersample_y: number;
  depth: boolean;
  depth_step?: number;
  peaks: boolean;
  /** Metres a summit must stand above its surroundings to be returned. */
  min_dominance?: number;
  /** Cut applied after the sort, so it keeps the summits worth labelling. */
  max_peaks?: number;
  /**
   * Exponent on distance in that sort, 0–4 — `0` is dominance alone. Sent as
   * the viewer's own `labelDistanceWeight`: the two orders still differ, ours
   * carrying a haze term the service's has no notion of, but it narrows the
   * gap where the cut binds, which is the only place either order matters.
   */
  peak_rank_power?: number;
  /**
   * Gain on the silhouettes' alpha, not an opacity: the geometry inks a near
   * ridge at ~0.55 and a far one at ~0.15, so `1` is already translucent.
   * Unbounded above — alpha clamps at composite — and `0` leaves bare relief.
   */
  ridge_strength?: number;
  /** Stroke thickness in output pixels, 0–20; independent of the alpha gain. */
  ridge_width?: number;
  /** `#rrggbb`; a malformed one is a 400 naming the field, not a silent default. */
  ridge_color?: string;
  /** `#rrggbb`, the near terrain before haze washes it towards the sky. */
  ground_color?: string;
  /**
   * Degrees of extra elevation at `range`, tapering to nothing at the eye,
   * 0–45. It warps the world rather than the picture, so it decides what hides
   * what: a range lifted clear of the ridge in front of it is drawn, and its
   * summits come back flagged `revealed`.
   */
  depth_lift?: number;
  /**
   * What the service encodes the picture as. AVIF by a wide margin — 216 KB
   * against PNG's 3.7 MB for a full turn — because this renderer draws nothing
   * but smooth gradients, and the sky dither that keeps them from banding is
   * exactly what PNG cannot pack.
   */
  format?: 'avif' | 'png';
  /**
   * AVIF quality, 1–100; ignored for PNG. It decides whether the sky dither
   * survives the encode, so it matters more here than it usually would: below
   * about 93 the encoder drops the noise and the banding comes back.
   */
  quality?: number;
  /** Amplitude of that dither in 8-bit levels; `0` turns it off. */
  dither_strength?: number;
}

/**
 * A labelled point the service found visible from the viewpoint. Only `osm_id`
 * identifies it — everything else about it (names in other languages, wikidata)
 * belongs to OSM, since the service's import keeps only what it needs.
 */
const PeakSchema = z.object({
  osm_id: z.number(),
  name: z.string(),
  type: z.string(),
  ele_osm: z.string().nullish(),
  lon: z.number(),
  lat: z.number(),
  /** From the terrain model; the OSM tag is unreliable, so prefer this. */
  ele: z.number().nullish(),
  distance: z.number(),
  azimuth: z.number(),
  altitude: z.number(),
  x: z.number(),
  /** Follows `depth_lift`, unlike `altitude`, so labels sit on their summits. */
  y: z.number(),
  visible: z.boolean(),
  /**
   * `depth_lift` is what brought it into view: drawn and nameable, but hidden
   * from the actual viewpoint. Defaulted, so a service older than this client
   * still renders rather than failing the parse.
   */
  revealed: z.boolean().default(false),
  /**
   * **Metres, signed**, the summit stands above the terrain around it within
   * 3 km of itself. Negative where the top never rises clear of its own ridge,
   * and then says how far that ridge stands over it; `0` means only that there
   * was nothing at its depth to compare against.
   *
   * Not prominence: topographic prominence is non-negative by definition, and
   * where this is positive the two agree closely, but the name would invite
   * comparison with published figures for tops that score below zero.
   *
   * An ordering, not a magnitude, and not a rank on its own: see `labelRank`,
   * since metres alone put a distant massif over a nearby hill that fills far
   * more of the frame.
   */
  dominance: z.number(),
});

export type Peak = z.infer<typeof PeakSchema>;

const DepthMetaSchema = z.object({
  near_m: z.number(),
  far_m: z.number(),
  step: z.number(),
  sky: z.number(),
});

const MetaSchema = z.object({
  width: z.number(),
  height: z.number(),
  /** Metres above sea level, the eye height already added. */
  eye_elevation: z.number(),
  az_start: z.number(),
  fov: z.number(),
  alt_min: z.number(),
  alt_max: z.number(),
  step_deg: z.number(),
  depth: DepthMetaSchema.nullish(),
  peaks: z.array(PeakSchema).nullish(),
});

export type PanoramaMeta = z.infer<typeof MetaSchema>;

export interface PanoramaResponse {
  meta: PanoramaMeta;
  /** Object URL of the rendered image; revoke it when it goes off screen. */
  imageUrl: string;
  depth: PanoramaDepth | null;
}

/**
 * Why a render didn't happen, in terms the panel can say something about.
 * `noData` is the service's 500, which in practice means the viewpoint has no
 * elevation data — the one failure a user can act on by clicking elsewhere.
 */
export type PanoramaErrorCode =
  | 'offline'
  | 'unreachable'
  | 'busy'
  | 'tooMany'
  | 'noData'
  | 'failed';

export function panoramaErrorCode(err: unknown): PanoramaErrorCode {
  // A request that never reached the server looks the same whether the machine
  // is offline, DNS failed, the service is down, or CORS refused the response —
  // the browser gives one `TypeError` for all of them. Only a browser that says
  // it is offline may be told it is offline; anything else says the service
  // could not be reached, which is all we actually know.
  if (isNetworkError(err)) {
    return navigator.onLine ? 'unreachable' : 'offline';
  }

  if (err instanceof HttpError) {
    return err.status === 503
      ? 'busy'
      : err.status === 429
        ? 'tooMany'
        : err.status === 500
          ? 'noData'
          : 'failed';
  }

  return 'failed';
}

const ProgressSchema = z.object({
  phase: z.enum(['queued', 'rendering', 'encoding', 'done']),
  /** Renders that must finish before this one starts; `0` means next. */
  ahead: z.number().default(0),
  /** 0–100 through the render; a column count, so the rate drifts a little. */
  percent: z.number().default(0),
});

/**
 * How far along a render is. The picture arrives all at once at the end, so
 * this comes over a side channel — see the service's `docs/API.md`.
 */
export type PanoramaProgress = z.infer<typeof ProgressSchema>;

/**
 * Rejects the service's `unknown` phase along with anything malformed: the
 * token is only registered once its request lands, and until then there is
 * nothing to say.
 */
function parseProgress(data: string): PanoramaProgress | null {
  try {
    const parsed = ProgressSchema.safeParse(JSON.parse(data));

    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

/**
 * Watches one render, by the token its request carries. Subscribed before the
 * request goes out, which is what makes the queued phase visible.
 */
function watchProgress(
  token: string,
  onProgress: (progress: PanoramaProgress) => void,
): () => void {
  const events = new EventSource(
    `${process.env['TERRAIN_URL']}/progress/${token}`,
  );

  // Set on open, not on the first usable event: the service reports `unknown`
  // until the request lands, and those parse to nothing.
  let opened = false;

  events.onopen = () => {
    opened = true;
  };

  events.onmessage = ({ data }) => {
    const progress = parseProgress(data);

    if (!progress) {
      return;
    }

    onProgress(progress);

    // `done` is the last event and the browser reopens a stream that ends.
    if (progress.phase === 'done') {
      events.close();
    }
  };

  // Never connected, so the side channel isn't there — let it go rather than
  // have the browser retry it for the length of the render.
  events.onerror = () => {
    if (!opened) {
      events.close();
    }
  };

  return () => events.close();
}

/**
 * Renders one panorama. Seconds of work on the server, serialised there, so the
 * caller owns the progress and the cancellation — pass the triggers that make
 * this render pointless. Hanging up stops the work within about a second, so a
 * reframed view must abort the render in flight rather than queue behind it.
 */
export async function renderPanorama(
  request: PanoramaRequest,
  getState: () => RootState,
  cancel: CancelTriggers,
  onProgress?: (progress: PanoramaProgress) => void,
): Promise<PanoramaResponse> {
  const { user } = getState().auth;

  // Ours to invent; the service only keys `/progress/{token}` on it.
  const token = crypto.randomUUID();

  const unwatch = onProgress ? watchProgress(token, onProgress) : undefined;

  try {
    const response = await httpRequest({
      ...cancel,
      getState,
      method: 'POST',
      // Absolute, so `httpRequest` adds no credentials of its own; the terrain
      // service clamps quality per account and needs the token to do it.
      url: `${process.env['TERRAIN_URL']}/panorama`,
      data: request,
      headers: {
        'X-Job': token,
        ...(user ? { Authorization: `Bearer ${user.authToken}` } : {}),
      },
    });

    const form = await response.formData();

    const metaPart = form.get('meta');

    if (typeof metaPart !== 'string') {
      throw new Error('missing panorama meta');
    }

    const meta = MetaSchema.parse(JSON.parse(metaPart));

    const imagePart = form.get('image');

    if (!(imagePart instanceof Blob)) {
      throw new Error('missing panorama image');
    }

    const depthPart = form.get('depth');

    // A picture without distances is worth far more than no picture: the
    // reading and the press-to-mark go quiet, everything else works, and the
    // panel is already built for a render that carries no depth at all.
    let depth: PanoramaDepth | null = null;

    if (meta.depth && depthPart instanceof Blob) {
      try {
        depth = await decodeDepth(
          depthPart,
          meta.width,
          meta.height,
          meta.depth,
        );
      } catch (err) {
        console.warn('panorama depth buffer could not be decoded', err);
      }
    }

    return { meta, imageUrl: URL.createObjectURL(imagePart), depth };
  } finally {
    unwatch?.();
  }
}
