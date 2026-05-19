import { authInitialState, authReducer } from '@features/auth/model/reducer.js';
import { UserSchema, UserSettingsSchema } from '@features/auth/model/types.js';
import { cachedMapsReducer } from '@features/cachedMaps/model/reducer.js';
import { changesetReducer } from '@features/changesets/model/reducer.js';
import {
  cookieConsentInitialState,
  cookieConsentReducer,
} from '@features/cookieConsent/model/reducer.js';
import { drawingLinesReducer } from '@features/drawing/model/reducers/drawingLinesReducer.js';
import { drawingPointsReducer } from '@features/drawing/model/reducers/drawingPointsReducer.js';
import {
  drawingSettingsInitialState,
  drawingSettingsReducer,
} from '@features/drawing/model/reducers/drawingSettingsReducer.js';
import { elevationChartReducer } from '@features/elevationChart/model/reducer.js';
import { GalleryColorizeBySchema } from '@features/gallery/model/actions.js';
import {
  galleryInitialState,
  galleryReducer,
} from '@features/gallery/model/reducer.js';
import { geoIpReducer } from '@features/geoip/model/reducer.js';
import {
  homeLocationInitialState,
  homeLocationReducer,
} from '@features/homeLocation/model/reducer.js';
import { l10nInitialState, l10nReducer } from '@features/l10n/model/reducer.js';
import {
  locationInitialState,
  locationReducer,
} from '@features/location/model/reducer.js';
import { LayerSettingsSchema } from '@features/map/model/actions.js';
import { mapInitialState, mapReducer } from '@features/map/model/reducer.js';
import {
  mapDetailsInitialState,
  mapDetailsReducer,
} from '@features/mapDetails/model/reducer.js';
import { mapsReducer } from '@features/myMaps/model/reducer.js';
import {
  objectInitialState,
  objectsReducer,
} from '@features/objects/model/reducer.js';
import { ShadingSchema } from '@features/parameterizedShading/Shading.js';
import { progressReducer } from '@features/progress/model/reducer.js';
import {
  routePlannerInitialState,
  routePlannerReducer,
} from '@features/routePlanner/model/reducer.js';
import { searchReducer } from '@features/search/model/reducer.js';
import { toastsReducer } from '@features/toasts/model/reducer.js';
import { trackingReducer } from '@features/tracking/model/reducer.js';
import {
  trackViewerInitialState,
  trackViewerReducer,
} from '@features/trackViewer/model/reducer.js';
import { websocketReducer } from '@features/websocket/model/reducer.js';
import { wikiReducer } from '@features/wiki/model/reducer.js';
import { wikimediaCommonsReducer } from '@features/wikimediaCommons/model/reducer.js';
import {
  CustomLayerDefArrayCompatSchema,
  StravaHeatmapColorSchema,
} from '@shared/mapDefinitions.js';
import { TransportTypeCompatSchema } from '@shared/transportTypeDefs.js';
import { LatLonSchema } from '@shared/types/common.js';
import storage from 'local-storage-fallback';
import z from 'zod';
import type { RootState } from '../store/store.js';
import { mainInitialState, mainReducer } from './reducer.js';

const PersistedAuthSchema = z.object({
  user: z
    .object({
      ...UserSchema.shape,
      settings: UserSettingsSchema.optional().catch(undefined),
    })
    .nullable()
    .optional(),
});

const PersistedMapSchema = z
  .object({
    lat: z.number(),
    lon: z.number(),
    zoom: z.number(),
    layers: z.array(z.string()),
    layersSettings: z.record(z.string(), LayerSettingsSchema),
    customLayers: CustomLayerDefArrayCompatSchema,
    legacyMapWarningSuppressions: z.array(z.string()),
    shading: ShadingSchema,
    maxZoom: z.number(),
    resolutionScale: z.number().nullable(),
    featureScale: z.number(),
    stravaHeatmapColor: StravaHeatmapColorSchema,
  })
  .partial();

const PersistedL10nSchema = z
  .object({
    chosenLanguage: z.string().nullable(),
  })
  .partial();

const PersistedCookieConsentSchema = z
  .object({
    cookieConsentResult: z.boolean().nullable(),
    analyticCookiesAllowed: z.boolean(),
  })
  .partial();

const PersistedDrawingSettingsSchema = z
  .object({
    drawingColor: z.string(),
    drawingWidth: z.number(),
    drawingRecentColors: z.array(z.string()),
  })
  .partial();

const PersistedHomeLocationSchema = z
  .object({
    homeLocation: LatLonSchema.nullable(),
  })
  .partial();

const PersistedLocationSchema = z
  .object({
    locate: z.boolean(),
    location: z
      .object({
        lat: z.number(),
        lon: z.number(),
        accuracy: z.number(),
      })
      .nullable(),
  })
  .partial();

const PersistedMainSchema = z
  .object({
    hiddenInfoBars: z.record(z.string(), z.number()),
  })
  .partial();

const PersistedObjectsSchema = z
  .object({
    selectedIcon: z.enum(['pin', 'square', 'ring']),
  })
  .partial();

const PersistedRoutePlannerSchema = z
  .object({
    preventHint: z.boolean(),
    transportType: TransportTypeCompatSchema,
    milestones: z.union([z.literal('abs'), z.literal('rel'), z.literal(false)]),
  })
  .partial();

const PersistedTrackViewerSchema = z
  .object({
    colorizeTrackBy: z.enum(['elevation', 'steepness']).nullable(),
  })
  .partial();

const MapDetailsSourceSchema = z.union([
  z.literal('nominatim-reverse'),
  z.literal('overpass-nearby'),
  z.literal('overpass-surrounding'),
  z.custom<`wms:${string}`>(
    (v) => typeof v === 'string' && v.startsWith('wms:'),
  ),
]);

const PersistedMapDetailsSchema = z
  .object({
    excludeSources: z.array(MapDetailsSourceSchema),
  })
  .partial();

const PersistedGallerySchema = z
  .object({
    colorizeBy: GalleryColorizeBySchema.nullable(),
    showDirection: z.boolean(),
    showLegend: z.boolean(),
    recentTags: z.array(z.string()),
    premium: z.boolean(),
  })
  .partial();

export const reducers = {
  auth: authReducer,
  cachedMaps: cachedMapsReducer,
  changesets: changesetReducer,
  cookieConsent: cookieConsentReducer,
  drawingSettings: drawingSettingsReducer,
  drawingLines: drawingLinesReducer,
  drawingPoints: drawingPointsReducer,
  elevationChart: elevationChartReducer,
  geoip: geoIpReducer,
  gallery: galleryReducer,
  homeLocation: homeLocationReducer,
  l10n: l10nReducer,
  location: locationReducer,
  main: mainReducer,
  mapDetails: mapDetailsReducer,
  map: mapReducer,
  objects: objectsReducer,
  progress: progressReducer,
  routePlanner: routePlannerReducer,
  search: searchReducer,
  toasts: toastsReducer,
  tracking: trackingReducer,
  trackViewer: trackViewerReducer,
  websocket: websocketReducer,
  maps: mapsReducer,
  wiki: wikiReducer,
  wikimediaCommons: wikimediaCommonsReducer,
};

export function getInitialState() {
  let persisted: Partial<Record<keyof RootState, unknown>>;

  try {
    persisted = JSON.parse(storage.getItem('store') ?? '{}');
  } catch {
    persisted = {};
  }

  const initial: Partial<RootState> = {};

  // Legacy: { mapType, overlays } → { layers }
  {
    const m = z
      .object({ mapType: z.string(), overlays: z.string().array() })
      .safeParse(persisted.map);

    if (m.success) {
      (persisted.map as unknown as { layers: string[] }).layers = [
        m.data.mapType,
        ...m.data.overlays,
      ];
    }
  }

  const map = PersistedMapSchema.safeParse(persisted.map);

  if (map.success) {
    initial.map = { ...mapInitialState, ...map.data };
  }

  const l10n = PersistedL10nSchema.safeParse(persisted.l10n);

  if (l10n.success) {
    initial.l10n = { ...l10nInitialState, ...l10n.data };
  }

  const auth = PersistedAuthSchema.safeParse(persisted.auth);

  if (auth.success) {
    initial.auth = {
      ...authInitialState,
      user:
        auth.data.user === undefined ? authInitialState.user : auth.data.user,
    };
  }

  const cookieConsent = parseWithFallback(
    PersistedCookieConsentSchema,
    persisted.cookieConsent,
    persisted.main,
  );

  if (cookieConsent) {
    initial.cookieConsent = { ...cookieConsentInitialState, ...cookieConsent };
  }

  const drawingSettings = parseWithFallback(
    PersistedDrawingSettingsSchema,
    persisted.drawingSettings,
    persisted.main,
  );

  if (drawingSettings) {
    initial.drawingSettings = {
      ...drawingSettingsInitialState,
      ...drawingSettings,
    };
  }

  const homeLocation = parseWithFallback(
    PersistedHomeLocationSchema,
    persisted.homeLocation,
    persisted.main,
  );

  if (homeLocation) {
    initial.homeLocation = { ...homeLocationInitialState, ...homeLocation };
  }

  const location = parseWithFallback(
    PersistedLocationSchema,
    persisted.location,
    persisted.main,
  );

  if (location) {
    initial.location = { ...locationInitialState, ...location };
  }

  const main = PersistedMainSchema.safeParse(persisted.main);

  if (main.success) {
    initial.main = { ...mainInitialState, ...main.data };
  }

  const objects = PersistedObjectsSchema.safeParse(persisted.objects);

  if (objects.success) {
    initial.objects = { ...objectInitialState, ...objects.data };
  }

  const routePlanner = PersistedRoutePlannerSchema.safeParse(
    persisted.routePlanner,
  );

  if (routePlanner.success) {
    initial.routePlanner = {
      ...routePlannerInitialState,
      ...routePlanner.data,
    };
  }

  const trackViewer = PersistedTrackViewerSchema.safeParse(
    persisted.trackViewer,
  );

  if (trackViewer.success) {
    initial.trackViewer = { ...trackViewerInitialState, ...trackViewer.data };
  }

  const mapDetails = PersistedMapDetailsSchema.safeParse(persisted.mapDetails);

  if (mapDetails.success) {
    initial.mapDetails = { ...mapDetailsInitialState, ...mapDetails.data };
  }

  const gallery = PersistedGallerySchema.safeParse(persisted.gallery);

  if (gallery.success) {
    initial.gallery = { ...galleryInitialState, ...gallery.data };
  }

  return initial;
}

function parseWithFallback<T extends object>(
  schema: z.ZodType<T>,
  primary: unknown,
  fallback: unknown,
): T | undefined {
  const a = schema.safeParse(primary);

  if (a.success && Object.keys(a.data).length > 0) {
    return a.data;
  }

  const b = schema.safeParse(fallback);

  return b.success && Object.keys(b.data).length > 0 ? b.data : undefined;
}
