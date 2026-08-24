import type { RootState } from '@app/store/store.js';
import type { CancelTriggers } from '@shared/cancelRegister.js';
import {
  requestTerrainRender,
  type TerrainProgress,
  terrainParts,
} from '@shared/terrainService.js';
import z from 'zod';

/** The layer's id in the registry, the URL hash and `map.layers`. */
export const VIEWSHED_LAYER = 'v';

/**
 * What the terrain service is asked for. Field names are the wire's, so the
 * request object goes out as-is — see `doc/viewshed.md` and the service's own
 * `docs/API.md`.
 */
export interface ViewshedRequest {
  lon: number;
  lat: number;
  /** How far to look, ground metres, up to 300 000. */
  radius: number;
  /** Ground metres per pixel; validated against `radius`, see `request.ts`. */
  scale: number;
  eye: number;
  /**
   * Metres around the viewpoint the eye is raised to the highest ground in,
   * 0–200. An eye a few metres below the summit beside it loses whole quadrants.
   */
  eye_search_radius?: number;
  /** Height of the thing looked *at*, metres above the ground. */
  target_height?: number;
  /** Curve on the image's own alpha, `alpha ** (1/gamma)`, 0.1–10. */
  gamma?: number;
  /** Least alpha visible ground may take, 0–1 — a stencil rather than a shading. */
  alpha_floor?: number;
  /** `#rrggbb`; a malformed one is a 400 naming the field. */
  color?: string;
  format?: 'avif' | 'png';
  /** AVIF quality, 1–100; ignored for PNG. */
  quality?: number;
}

const MetaSchema = z.object({
  /** `[west, south, east, north]` in degrees — what `ImageOverlay` wants. */
  bounds: z.tuple([z.number(), z.number(), z.number(), z.number()]),
  /** Metres above sea level, the eye height already added. */
  eye_elevation: z.number(),
  width: z.number(),
  height: z.number(),
  radius: z.number(),
  scale: z.number(),
});

export type ViewshedMeta = z.infer<typeof MetaSchema>;

export interface ViewshedResponse {
  meta: ViewshedMeta;
  /** Object URL of the overlay image; revoke it when it is replaced. */
  imageUrl: string;
}

/** Renders one viewshed; see {@link requestTerrainRender}. */
export async function renderViewshed(
  request: ViewshedRequest,
  getState: () => RootState,
  cancel: CancelTriggers,
  onProgress?: (progress: TerrainProgress) => void,
): Promise<ViewshedResponse> {
  const form = await requestTerrainRender(
    '/viewshed',
    request,
    getState,
    cancel,
    onProgress,
  );

  return terrainParts(form, MetaSchema);
}
