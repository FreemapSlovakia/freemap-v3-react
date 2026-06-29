import { httpRequest } from '@app/httpRequest.js';
import { setActiveModal } from '@app/store/actions.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { authLogout, authSetUser } from '@features/auth/model/actions.js';
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
import { CustomLayerDefArrayCompatSchema } from '@shared/mapDefinitions.js';
import { TransportTypeCompatSchema } from '@shared/transportTypeDefs.js';
import z from 'zod';
import { GeoJSONFeatureCollectionSchema } from 'zod-geojson';
import { loadMyMapsMessages } from '../../translations/loadMyMapsMessages.js';
import { MapMetaSchema, mapsLoad, mapsLoaded } from '../actions.js';

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

const MapsLoadResponseSchema = z.object({
  meta: MapMetaSchema,
  data: z.object({
    lines: z.array(LineCompatSchema).optional(),
    points: z.array(DrawingPointCompatSchema).optional(),
    tracking: z
      .object({
        trackedDevices: z.array(TrackedDeviceSchema).optional(),
        showLine: z.boolean().optional(),
        showPoints: z.boolean().optional(),
      })
      .optional(),
    routePlanner: RoutePlannerMapDataCompatSchema.optional(),
    galleryFilter: GalleryFilterSchema.optional(),
    trackViewer: TrackViewerMapDataSchema.optional(),
    map: MapMapDataCompatSchema.optional(),
    objectsV2: z.object({ active: z.array(z.string()) }).optional(),
  }),
});

export const mapsLoadProcessor: Processor = {
  actionCreator: [mapsLoad, authSetUser, authLogout],
  handle: async ({ getState, dispatch, action, toastError }) => {
    const {
      auth,
      myMaps: { loadMeta },
    } = getState();

    if (!loadMeta || (auth.user && !auth.validated)) {
      return;
    }

    if (action.type === mapsLoad.type) {
      window._paq.push([
        'trackEvent',
        'MyMaps',
        'load',
        loadMeta.merge ? 'merge' : 'replace',
      ]);
    }

    try {
      const res = await httpRequest({
        getState,
        url: `/maps/${loadMeta.id}`,
        expectedStatus: 200,
        cancelActions: [mapsLoad, authSetUser, authLogout],
      });

      const { meta, data } = MapsLoadResponseSchema.parse(await res.json());

      if (data.map) {
        if (loadMeta.ignoreMap) {
          delete data.map.lat;
          delete data.map.lon;
          delete data.map.zoom;
        }

        if (loadMeta.ignoreLayers) {
          delete data.map.layers;
          delete data.map.shading;
        }
      }

      dispatch(
        mapsLoaded({
          merge: loadMeta.merge,
          meta,
          data,
        }),
      );

      dispatch(setActiveModal(null));
    } catch (err) {
      await toastError(err, loadMyMapsMessages, 'fetchError');
    }
  },
};
