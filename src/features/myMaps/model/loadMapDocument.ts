import { httpRequest, isNetworkError } from '@app/httpRequest.js';
import type { RootState } from '@app/store/store.js';
import { LineCompatSchema } from '@features/drawing/model/actions/drawingLineActions.js';
import { DrawingPointCompatSchema } from '@features/drawing/model/actions/drawingPointActions.js';
import { GalleryFilterSchema } from '@features/gallery/model/actions.js';
import { ShadingSchema } from '@features/parameterizedShading/model/Shading.js';
import {
  PickModeSchema,
  RoutePointSchema,
  RoutingModeSchema,
} from '@features/routePlanner/model/actions.js';
import { TrackedDeviceSchema } from '@features/tracking/model/types.js';
import type { ActionCreatorMatchable } from '@shared/cancelRegister.js';
import { CustomLayerDefArrayCompatSchema } from '@shared/mapDefinitions.js';
import { TransportTypeCompatSchema } from '@shared/transportTypeDefs.js';
import z from 'zod';
import { GeoJSONFeatureCollectionSchema } from 'zod-geojson';
import { getOfflineMap } from '../offlineStore.js';
import { type MapData, type MapMeta, MapMetaSchema } from './actions.js';

const RoutePlannerMapDataCompatSchema = z.preprocess(
  (v) => {
    if (
      typeof v !== 'object' ||
      v === null ||
      'points' in v ||
      !('start' in v || 'midpoints' in v || 'finish' in v)
    ) {
      return v;
    }

    const { start, midpoints, finish, ...rest } = v as {
      start?: unknown;
      midpoints?: unknown[];
      finish?: unknown;
      [k: string]: unknown;
    };

    return {
      ...rest,
      points: [start, ...(midpoints ?? []), finish].filter(Boolean),
      finishOnly: Boolean(finish) && !start,
    };
  },
  z.object({
    transportType: TransportTypeCompatSchema.optional(),
    points: z.array(RoutePointSchema).optional(),
    finishOnly: z.boolean().optional(),
    pickMode: PickModeSchema.nullable().optional(),
    mode: RoutingModeSchema.optional(),
    milestones: z
      .union([z.literal('abs'), z.literal('rel'), z.literal(false)])
      .optional(),
    // Part of what the URL carries for a roundtrip/isochrone route, so the
    // document has to carry it too — otherwise a saved map of either kind reads
    // as changed the moment it is compared against its own document.
    roundtripParams: z
      .object({ distance: z.number(), seed: z.number() })
      .optional(),
    isochroneParams: z
      .object({
        buckets: z.number(),
        distanceLimit: z.number(),
        timeLimit: z.number(),
      })
      .optional(),
  }),
);

const MapMapDataCompatSchema = z.preprocess(
  (v) => {
    if (
      typeof v === 'object' &&
      v !== null &&
      'mapType' in v &&
      'overlays' in v &&
      Array.isArray(v.overlays)
    ) {
      const { mapType, overlays, ...rest } = v as {
        mapType: string;
        overlays: string[];
        [k: string]: unknown;
      };

      return { ...rest, layers: [mapType, ...overlays] };
    }

    return v;
  },
  z.object({
    lat: z.number().optional(),
    lon: z.number().optional(),
    zoom: z.number().optional(),
    layers: z.array(z.string()).optional(),
    customLayers: CustomLayerDefArrayCompatSchema.optional(),
    shading: ShadingSchema.optional(),
  }),
);

// Colorize is a global display preference (`trackViewerSettings`), not part of
// the saved map document, so it is intentionally absent here; an old map's
// `colorizeTrackBy` is simply ignored on load.
const TrackViewerMapDataSchema = z.object({
  trackGeojson: GeoJSONFeatureCollectionSchema.nullable().optional(),
  trackUID: z.string().nullable().optional(),
  gpxUrl: z.string().nullable().optional(),
});

export const MapsLoadResponseSchema = z.object({
  meta: MapMetaSchema,
  data: z.object({
    lines: z.array(LineCompatSchema).optional(),
    points: z.array(DrawingPointCompatSchema).optional(),
    tracking: z
      .object({
        trackedDevices: z.array(TrackedDeviceSchema).optional(),
      })
      .optional(),
    routePlanner: RoutePlannerMapDataCompatSchema.optional(),
    galleryFilter: GalleryFilterSchema.optional(),
    trackViewer: TrackViewerMapDataSchema.optional(),
    map: MapMapDataCompatSchema.optional(),
    objectsV2: z.object({ active: z.array(z.string()) }).optional(),
  }),
});

/**
 * Fetches and parses a saved map document (`GET /maps/:id`). Shared by the
 * online load path and the offline-caching path so the endpoint and schema live
 * in one place.
 */
export async function loadMapDocument(
  id: string,
  getState: () => RootState,
  cancelActions: ActionCreatorMatchable[],
): Promise<{ meta: MapMeta; data: MapData }> {
  const res = await httpRequest({
    getState,
    url: `/maps/${id}`,
    expectedStatus: 200,
    cancelActions,
  });

  return MapsLoadResponseSchema.parse(await res.json());
}

/**
 * Reads a map document, falling back to the offline copy.
 *
 * The fallback is deliberately limited to being offline or a genuine network
 * failure: a 403/404/500 is an answer from the server and must surface, or a map
 * that was deleted or is no longer shared would keep opening from a stale cached
 * copy. Shared by the load and the restore so neither can drift from that rule.
 */
export async function readMapDocument(
  id: string,
  getState: () => RootState,
  cancelActions: ActionCreatorMatchable[],
): Promise<{ meta: MapMeta; data: MapData; fromNetwork: boolean }> {
  try {
    if (!navigator.onLine) {
      throw new Error('offline');
    }

    return {
      ...(await loadMapDocument(id, getState, cancelActions)),
      fromNetwork: true,
    };
  } catch (err) {
    const offline =
      !navigator.onLine || isNetworkError(err)
        ? await getOfflineMap(id)
        : undefined;

    if (!offline) {
      throw err;
    }

    return { ...offline, fromNetwork: false };
  }
}
