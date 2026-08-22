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
  supersample_x: number;
  supersample_y: number;
  depth: boolean;
  depth_step?: number;
  peaks: boolean;
  /** Metres a summit must stand above its surroundings to be returned. */
  min_dominance?: number;
  /** Cut applied after the sort, so it keeps the dominant summits. */
  max_peaks?: number;
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
  y: z.number(),
  visible: z.boolean(),
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
  /**
   * How many renders were waiting when this one was admitted. It arrives with
   * the finished picture, so it can't drive a live queue readout — it says
   * afterwards that the service is busy, which the next wait can warn about.
   */
  queueDepth: number;
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
): Promise<PanoramaResponse> {
  const { user } = getState().auth;

  const response = await httpRequest({
    ...cancel,
    getState,
    method: 'POST',
    // Absolute, so `httpRequest` adds no credentials of its own; the terrain
    // service clamps quality per account and needs the token to do it.
    url: `${process.env['TERRAIN_URL']}/panorama`,
    data: request,
    ...(user ? { headers: { Authorization: `Bearer ${user.authToken}` } } : {}),
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

  // A picture without distances is worth far more than no picture: the reading
  // and the press-to-mark go quiet, everything else works, and the panel is
  // already built for a render that carries no depth at all.
  let depth: PanoramaDepth | null = null;

  if (meta.depth && depthPart instanceof Blob) {
    try {
      depth = await decodeDepth(depthPart, meta.width, meta.height, meta.depth);
    } catch (err) {
      console.warn('panorama depth buffer could not be decoded', err);
    }
  }

  return {
    meta,
    imageUrl: URL.createObjectURL(imagePart),
    depth,
    queueDepth: Number(response.headers.get('X-Queue-Depth')) || 0,
  };
}
