import type { RootState } from '@app/store/store.js';
import type { CancelTriggers } from '@shared/cancelRegister.js';
import {
  requestTerrainRender,
  type TerrainProgress,
  terrainParts,
} from '@shared/terrainService.js';
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

/** Renders one panorama; see {@link requestTerrainRender}. */
export async function renderPanorama(
  request: PanoramaRequest,
  getState: () => RootState,
  cancel: CancelTriggers,
  onProgress?: (progress: TerrainProgress) => void,
): Promise<PanoramaResponse> {
  const form = await requestTerrainRender(
    '/panorama',
    request,
    getState,
    cancel,
    onProgress,
  );

  const { meta, imageUrl } = terrainParts(form, MetaSchema);

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

  return { meta, imageUrl, depth };
}
