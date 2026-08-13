import { LineCompatSchema } from '@features/drawing/model/actions/drawingLineActions.js';
import { DrawingPointCompatSchema } from '@features/drawing/model/actions/drawingPointActions.js';
import { GalleryFilterSchema } from '@features/gallery/model/actions.js';
import { ShadingSchema } from '@features/parameterizedShading/model/Shading.js';
import {
  PickModeSchema,
  RoutePointSchema,
  RoutingModeSchema,
  SavedRouteSchema,
} from '@features/routePlanner/model/actions.js';
import { SavedSearchResultSchema } from '@features/search/model/actions.js';
import { TrackedDeviceSchema } from '@features/tracking/model/types.js';
import { CustomLayerDefArrayCompatSchema } from '@shared/mapDefinitions.js';
import { TransportTypeCompatSchema } from '@shared/transportTypeDefs.js';
import z from 'zod';
import { GeoJSONFeatureCollectionSchema } from 'zod-geojson';
import { MapMetaSchema } from './actions.js';

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
    // Optional, and only ever read as a whole: a document written before routes
    // were stored simply has none and is routed on open, exactly as it was. A
    // result that won't parse is dropped for the same reason rather than
    // rejecting the document — it is a cache, and taking the map down with it
    // would leave it unopenable, offline copy included.
    result: SavedRouteSchema.optional().catch(undefined),
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
const DataViewerMapDataSchema = z.object({
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
    trackViewer: DataViewerMapDataSchema.optional(),
    map: MapMapDataCompatSchema.optional(),
    objectsV2: z.object({ active: z.array(z.string()) }).optional(),
    // The results pinned to the map. A pin that won't parse is dropped on its
    // own: they are a cache of what the map holds, so one odd result may cost
    // neither the others nor the map, which taking the document down with it
    // would leave unopenable, offline copy included. The `catch` covers a
    // `search` that isn't of the right shape at all.
    search: z
      .object({
        results: z.array(z.unknown()).transform((results) =>
          results.flatMap((result) => {
            const parsed = SavedSearchResultSchema.safeParse(result);

            return parsed.success ? [parsed.data] : [];
          }),
        ),
      })
      .optional()
      .catch(undefined),
  }),
});
