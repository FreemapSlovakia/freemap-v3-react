import { authInitialState } from '@features/auth/model/reducer.js';
import { UserSchema, UserSettingsSchema } from '@features/auth/model/types.js';
import { cachedMapsSettingsInitialState } from '@features/cachedMaps/model/settingsReducer.js';
import { cookieConsentInitialState } from '@features/cookieConsent/model/reducer.js';
import { dataViewerSettingsInitialState } from '@features/dataViewer/model/settingsReducer.js';
import {
  DrawingSettingsCompatSchema,
  DrawingStyleSchema,
  drawingSettingsInitialState,
} from '@features/drawing/model/reducers/drawingSettingsReducer.js';
import {
  elevationSettingsInitialState,
  GRADE_WINDOW_WHOLE_LINE,
} from '@features/elevationChart/model/settingsReducer.js';
import { GalleryLicenseSchema } from '@features/gallery/licenses.js';
import { GalleryColorizeBySchema } from '@features/gallery/model/actions.js';
import { gallerySettingsInitialState } from '@features/gallery/model/settingsReducer.js';
import { gpsRecorderSettingsInitialState } from '@features/gpsRecorder/model/settingsReducer.js';
import { RecorderConfigSchema } from '@features/gpsRecorder/protocol.js';
import { homeLocationInitialState } from '@features/homeLocation/model/reducer.js';
import { l10nInitialState } from '@features/l10n/model/reducer.js';
import {
  HeadingSourceSchema,
  locationSettingsInitialState,
} from '@features/location/model/settingsReducer.js';
import { LayerSettingsSchema } from '@features/map/model/actions.js';
import { mapInitialState } from '@features/map/model/reducer.js';
import { mapDetailsInitialState } from '@features/mapDetails/model/reducer.js';
import { MarkerTypeSchema } from '@features/objects/model/actions.js';
import { objectsSettingsInitialState } from '@features/objects/model/settingsReducer.js';
import {
  DEPTH_LIFT_MAX,
  LABEL_DENSITY_MAX,
  LABEL_DISTANCE_WEIGHT_MAX,
  LABEL_HAZE_MAX_KM,
  PROMINENCE_WEIGHT_MAX,
  panoramaSettingsInitialState,
  RANGE_MAX_KM,
  RANGE_MIN_KM,
} from '@features/panorama/model/settingsReducer.js';
import { ShadingSchema } from '@features/parameterizedShading/model/Shading.js';
import { routePlannerInitialState } from '@features/routePlanner/model/reducer.js';
import { routePlannerSettingsInitialState } from '@features/routePlanner/model/settingsReducer.js';
import { SearchResultStyleSchema } from '@features/search/model/actions.js';
import { searchSettingsInitialState } from '@features/search/model/settingsReducer.js';
import { trackingSettingsInitialState } from '@features/tracking/model/settingsReducer.js';
import { weatherRadarSettingsInitialState } from '@features/weatherRadar/model/settingsReducer.js';
import { ColorizeSettingsShape } from '@shared/colorizers/colorizeSettings.js';
import { ColorizingModeSchema } from '@shared/colorizers/index.js';
import { LanguageSchema } from '@shared/langUtils.js';
import { CustomLayerDefArrayCompatSchema } from '@shared/mapDefinitions.js';
import { TransportTypeCompatSchema } from '@shared/transportTypeDefs.js';
import { LatLonSchema } from '@shared/types/common.js';
import storage from 'local-storage-fallback';
import z from 'zod';
import { mainInitialState } from './reducer.js';
import type { RootState } from './store.js';

/** localStorage key holding the serialized persisted Redux state. */
export const STORAGE_KEY = 'store';

export const PersistedAuthSchema = z.object({
  user: z
    .object({
      ...UserSchema.shape,
      settings: UserSettingsSchema.optional().catch(undefined),
    })
    .nullable()
    .optional(),
});

export const PersistedMapSchema = z
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
    zoomSnap: z.number(),
  })
  .partial();

const LegacyMapSchema = z.object({
  mapType: z.string(),
  overlays: z.string().array(),
});

// Accepts the legacy `{ mapType, overlays }` shape, mapping it to `{ layers }`.
const PersistedMapCompatSchema = z.preprocess((raw) => {
  const m = LegacyMapSchema.safeParse(raw);

  return m.success && raw && typeof raw === 'object'
    ? { ...raw, layers: [m.data.mapType, ...m.data.overlays] }
    : raw;
}, PersistedMapSchema);

export const PersistedL10nSchema = z
  .object({
    chosenLanguage: LanguageSchema.nullable(),
  })
  .partial();

export const PersistedCookieConsentSchema = z
  .object({
    cookieConsentResult: z.boolean().nullable(),
    analyticCookiesAllowed: z.boolean(),
  })
  .partial();

export const PersistedHomeLocationSchema = z
  .object({
    homeLocation: LatLonSchema.nullable(),
  })
  .partial();

export const PersistedMainSchema = z
  .object({
    hiddenInfoBars: z.record(z.string(), z.number()),
    shownInfoBars: z.record(z.string(), z.number()),
  })
  .partial();

export const PersistedObjectsSettingsSchema = z
  .object({
    selectedIcon: MarkerTypeSchema,
    color: z.string(),
    showDetails: z.boolean(),
  })
  .partial();

// `transportType`/`milestones` stay in the transient route slice (the route
// document state the reducer routes on, also URL-synced and saved per map);
// they are persisted only as last-used defaults that survive a map clear.
export const PersistedRoutePlannerSchema = z
  .object({
    transportType: TransportTypeCompatSchema,
    milestones: z.union([z.literal('abs'), z.literal('rel'), z.literal(false)]),
  })
  .partial();

export const PersistedRoutePlannerSettingsSchema = z
  .object({
    ...ColorizeSettingsShape,
    preventHint: z.boolean(),
    lineWidth: z.number(),
    lineOpacity: z.number(),
    markerOpacity: z.number(),
  })
  .partial();

export const PersistedElevationSettingsSchema = z
  .object({
    despikeWindow: z.number().min(0).max(100),
    ditchFillWindow: z.number().min(0).max(100),
    gradeWindow: z.union([
      z.literal(GRADE_WINDOW_WHOLE_LINE),
      z.number().min(0).max(200),
    ]),
  })
  .partial();

const PersistedPanoramaSettingsSchema = z
  .object({
    quality: z.enum(['superfast', 'fast', 'standard', 'detailed', 'finest']),
    tilt: z.enum(['standard', 'wide', 'flat', 'custom']),
    altMin: z.number(),
    altMax: z.number(),
    eye: z.number(),
    // Bounded to what the slider offers: the request adds it to the top of the
    // band, and the service refuses anything past 45 outright.
    depthLift: z.number().min(0).max(DEPTH_LIFT_MAX),
    // The asked-for figure, which may be past what a lapsed account may have —
    // `grantedRangeKm` clamps the request, so premium grants it back silently.
    rangeKm: z.number().min(RANGE_MIN_KM).max(RANGE_MAX_KM),
    showRevealedLabels: z.boolean(),
    ridgeStrength: z.number(),
    ridgeWidth: z.number(),
    ridgeColor: z.string(),
    groundColor: z.string(),
    // Bounded, because the level indexes the menu's icon and word arrays.
    labelDensity: z.number().int().min(0).max(LABEL_DENSITY_MAX),
    minDominance: z.number(),
    // Bounded to what the sliders offer: all three reach `rankLabels`, where a
    // stored value from outside the range would order the names by something
    // no control can undo.
    labelHazeKm: z.number().min(0).max(LABEL_HAZE_MAX_KM),
    labelDistanceWeight: z.number().min(0).max(LABEL_DISTANCE_WEIGHT_MAX),
    prominenceWeight: z.number().min(0).max(PROMINENCE_WEIGHT_MAX),
    autoPan: z.boolean(),
  })
  .partial();

export const PersistedSearchSettingsSchema = z
  .object({
    resultStyle: SearchResultStyleSchema.partial(),
  })
  .partial();

export const PersistedDataViewerSettingsSchema = z
  .object({
    style: DrawingStyleSchema.partial(),
    colorizeTrackBy: ColorizingModeSchema.nullable(),
    colorizeLegend: z.boolean(),
  })
  .partial();

export const PersistedTrackingSettingsSchema = z
  .object({
    ...ColorizeSettingsShape,
    showLine: z.boolean(),
    showPoints: z.boolean(),
  })
  .partial();

export const PersistedGpsRecorderSettingsSchema = z
  .object({
    ...RecorderConfigSchema.shape,
    splitGapS: z.number().nonnegative(),
    feedLocation: z.boolean(),
    keepScreenAwake: z.boolean(),
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

export const PersistedMapDetailsSchema = z
  .object({
    excludeSources: z.array(MapDetailsSourceSchema),
  })
  .partial();

export const PersistedLocationSettingsSchema = z
  .object({
    headingSource: HeadingSourceSchema,
    showBearingLine: z.boolean(),
  })
  .partial();

export const PersistedGallerySettingsSchema = z
  .object({
    colorizeBy: GalleryColorizeBySchema.nullable(),
    recentTags: z.array(z.string()),
    showDirection: z.boolean(),
    showLegend: z.boolean(),
    premium: z.boolean(),
    license: GalleryLicenseSchema,
  })
  .partial();

export const PersistedWeatherRadarSettingsSchema = z
  .object({ showNowcast: z.boolean() })
  .partial();

/**
 * Single source of truth for persisted state. One entry per slice drives both
 * the save side (`selectPersistedState`, used by `statePersistingMiddleware`)
 * and the rehydrate side (`getInitialState`), so persisting a new field means
 * editing one entry.
 */
type PersistEntry<K extends keyof RootState = keyof RootState> = {
  key: K;
  /** Validates the persisted blob for this slice. */
  schema: z.ZodType;
  /** Slice initial state, used as the merge base on rehydrate. */
  initial: RootState[K];
  /** Another slice this data may also live under (e.g. `main`); read if the primary is absent/empty. */
  fallbackKey?: keyof RootState;
  /** Merge the `fallbackKey` data under the primary (fill gaps) instead of letting a non-empty primary win — needed only when the primary key predates a migrated field (currently just `trackViewerSettings`, whose key already held `style`). */
  mergeFallback?: boolean;
  /** Merge parsed data over `initial`. Default: `{ ...initial, ...data }`. */
  rehydrate?: (initial: RootState[K], data: any) => RootState[K];
  /** What to write to localStorage on save; omit to make the slice rehydrate-only. */
  persist?: (slice: RootState[K]) => unknown;
};

/** Captures per-key typing at the definition site; widens to the union in the array. */
function defineEntry<K extends keyof RootState>(
  entry: PersistEntry<K>,
): PersistEntry {
  return entry as unknown as PersistEntry;
}

const PersistedCachedMapsSettingsSchema = z
  .object({
    mode: z.enum([
      'network-only',
      'network-first',
      'cache-first',
      'cache-only',
    ]),
    store: z.boolean(),
    maxAgeDays: z.number(),
    maxSizeMb: z.number(),
  })
  .partial();

const PERSIST: PersistEntry[] = [
  defineEntry({
    key: 'map',
    schema: PersistedMapCompatSchema,
    initial: mapInitialState,
    // Rehydration writes the slice directly, so the zoom bypasses the reducer's
    // own snapping. A stored zoom can disagree with the stored `zoomSnap` when
    // the grid was coarsened by something other than the preference — a rebuilt
    // default, or one browser's storage read by another build — and the map
    // would then sit a fraction off what the store and the URL claim.
    rehydrate: (initial, data) => {
      const merged = { ...initial, ...data };

      return {
        ...merged,
        zoom: merged.zoomSnap
          ? Math.round(merged.zoom / merged.zoomSnap) * merged.zoomSnap
          : merged.zoom,
      };
    },
    persist: (m) => ({
      layersSettings: m.layersSettings,
      lat: m.lat,
      lon: m.lon,
      zoom: m.zoom,
      layers: m.layers,
      customLayers: m.customLayers,
      legacyMapWarningSuppressions: m.legacyMapWarningSuppressions,
      shading: m.shading,
      maxZoom: m.maxZoom,
      resolutionScale: m.resolutionScale,
      featureScale: m.featureScale,
      zoomSnap: m.zoomSnap,
    }),
  }),
  defineEntry({
    key: 'l10n',
    schema: PersistedL10nSchema,
    initial: l10nInitialState,
    persist: (s) => ({ chosenLanguage: s.chosenLanguage }),
  }),
  defineEntry({
    key: 'auth',
    schema: PersistedAuthSchema,
    initial: authInitialState,
    rehydrate: (initial, data) => ({
      ...initial,
      user: data.user === undefined ? initial.user : data.user,
    }),
    persist: (a) => ({
      user: a.user && {
        ...a.user,
        premiumExpiration: a.user.premiumExpiration
          ? (a.user.premiumExpiration?.toISOString() ?? null)
          : null,
      },
    }),
  }),
  defineEntry({
    key: 'cookieConsent',
    schema: PersistedCookieConsentSchema,
    initial: cookieConsentInitialState,
    fallbackKey: 'main',
    persist: (c) => ({
      cookieConsentResult: c.cookieConsentResult,
      analyticCookiesAllowed: c.analyticCookiesAllowed,
    }),
  }),
  defineEntry({
    key: 'drawingSettings',
    schema: DrawingSettingsCompatSchema,
    initial: drawingSettingsInitialState,
    fallbackKey: 'main',
    rehydrate: (initial, data) => ({
      ...initial,
      ...data,
      style: { ...initial.style, ...data.style },
    }),
    persist: (s) => s,
  }),
  defineEntry({
    key: 'homeLocation',
    schema: PersistedHomeLocationSchema,
    initial: homeLocationInitialState,
    fallbackKey: 'main',
    persist: (h) => ({ homeLocation: h.homeLocation }),
  }),
  defineEntry({
    key: 'main',
    schema: PersistedMainSchema,
    initial: mainInitialState,
    persist: (s) => ({
      hiddenInfoBars: s.hiddenInfoBars,
      shownInfoBars: s.shownInfoBars,
    }),
  }),
  defineEntry({
    key: 'objectsSettings',
    schema: PersistedObjectsSettingsSchema,
    initial: objectsSettingsInitialState,
    persist: (o) => ({
      selectedIcon: o.selectedIcon,
      color: o.color,
      showDetails: o.showDetails,
    }),
  }),
  defineEntry({
    key: 'routePlanner',
    schema: PersistedRoutePlannerSchema,
    initial: routePlannerInitialState,
    persist: (r) => ({
      transportType: r.transportType,
      milestones: r.milestones,
    }),
  }),
  defineEntry({
    key: 'routePlannerSettings',
    schema: PersistedRoutePlannerSettingsSchema,
    initial: routePlannerSettingsInitialState,
    // Also read these prefs from the `routePlanner` blob, which can carry them.
    fallbackKey: 'routePlanner',
    persist: (s) => ({
      colorizeBy: s.colorizeBy,
      colorizeLegend: s.colorizeLegend,
      preventHint: s.preventHint,
      lineWidth: s.lineWidth,
      lineOpacity: s.lineOpacity,
      markerOpacity: s.markerOpacity,
    }),
  }),
  defineEntry({
    key: 'searchSettings',
    schema: PersistedSearchSettingsSchema,
    initial: searchSettingsInitialState,
    rehydrate: (initial, data) => ({
      ...initial,
      resultStyle: { ...initial.resultStyle, ...data.resultStyle },
    }),
    persist: (s) => ({ resultStyle: s.resultStyle }),
  }),
  defineEntry({
    key: 'panoramaSettings',
    schema: PersistedPanoramaSettingsSchema,
    initial: panoramaSettingsInitialState,
    persist: (p) => p,
  }),
  defineEntry({
    key: 'elevationSettings',
    schema: PersistedElevationSettingsSchema,
    initial: elevationSettingsInitialState,
    persist: (e) => ({
      despikeWindow: e.despikeWindow,
      ditchFillWindow: e.ditchFillWindow,
      gradeWindow: e.gradeWindow,
    }),
  }),
  defineEntry({
    key: 'trackViewerSettings',
    schema: PersistedDataViewerSettingsSchema,
    initial: dataViewerSettingsInitialState,
    // Also read the colorize prefs from the legacy `trackViewer` blob. This
    // slice's key predates the colorize move (it persisted `style`), so the
    // fallback must fill colorize per key rather than be shadowed by the
    // already-present primary.
    fallbackKey: 'trackViewer',
    mergeFallback: true,
    rehydrate: (initial, data) => ({
      ...initial,
      ...data,
      style: { ...initial.style, ...data.style },
    }),
    persist: (t) => ({
      style: t.style,
      colorizeTrackBy: t.colorizeTrackBy,
      colorizeLegend: t.colorizeLegend,
    }),
  }),
  defineEntry({
    key: 'gpsRecorderSettings',
    schema: PersistedGpsRecorderSettingsSchema,
    initial: gpsRecorderSettingsInitialState,
    persist: (g) => ({
      intervalMs: g.intervalMs,
      minDistanceM: g.minDistanceM,
      maxAccuracyM: g.maxAccuracyM,
      priority: g.priority,
      source: g.source,
      splitGapS: g.splitGapS,
      feedLocation: g.feedLocation,
      keepScreenAwake: g.keepScreenAwake,
    }),
  }),
  defineEntry({
    key: 'trackingSettings',
    schema: PersistedTrackingSettingsSchema,
    initial: trackingSettingsInitialState,
    // Also read these prefs from the `tracking` blob, which can carry them.
    fallbackKey: 'tracking',
    persist: (t) => ({
      colorizeBy: t.colorizeBy,
      colorizeLegend: t.colorizeLegend,
      showLine: t.showLine,
      showPoints: t.showPoints,
    }),
  }),
  defineEntry({
    key: 'mapDetails',
    schema: PersistedMapDetailsSchema,
    initial: mapDetailsInitialState,
    persist: (m) => ({ excludeSources: m.excludeSources }),
  }),
  defineEntry({
    key: 'locationSettings',
    schema: PersistedLocationSettingsSchema,
    initial: locationSettingsInitialState,
    persist: (l) => ({
      headingSource: l.headingSource,
      showBearingLine: l.showBearingLine,
    }),
  }),
  defineEntry({
    key: 'gallerySettings',
    schema: PersistedGallerySettingsSchema,
    initial: gallerySettingsInitialState,
    // Also read these prefs from the `gallery` blob, which can carry them.
    fallbackKey: 'gallery',
    persist: (g) => ({
      colorizeBy: g.colorizeBy,
      recentTags: g.recentTags,
      showDirection: g.showDirection,
      showLegend: g.showLegend,
      premium: g.premium,
    }),
  }),
  defineEntry({
    key: 'cachedMapsSettings',
    schema: PersistedCachedMapsSettingsSchema,
    initial: cachedMapsSettingsInitialState,
    persist: (s) => s,
  }),
  defineEntry({
    key: 'weatherRadarSettings',
    schema: PersistedWeatherRadarSettingsSchema,
    initial: weatherRadarSettingsInitialState,
    persist: (r) => ({ showNowcast: r.showNowcast }),
  }),
];

export function getInitialState(): Partial<RootState> {
  let persisted: Partial<Record<keyof RootState, unknown>>;

  try {
    persisted = JSON.parse(storage.getItem(STORAGE_KEY) ?? '{}');
  } catch {
    persisted = {};
  }

  const initial: Partial<RootState> = {};

  for (const entry of PERSIST) {
    const raw = persisted[entry.key];

    let data: unknown;

    if (entry.fallbackKey) {
      data = parseWithFallback(
        entry.schema,
        raw,
        persisted[entry.fallbackKey],
        entry.mergeFallback,
      );
    } else {
      const result = entry.schema.safeParse(raw);

      data = result.success ? result.data : undefined;
    }

    if (data === undefined) {
      continue;
    }

    (initial as Record<keyof RootState, unknown>)[entry.key] = entry.rehydrate
      ? entry.rehydrate(entry.initial as never, data)
      : { ...(entry.initial as object), ...(data as object) };
  }

  return initial;
}

export function selectPersistedState(state: RootState): Partial<RootState> {
  const out: Record<string, unknown> = {};

  for (const entry of PERSIST) {
    if (entry.persist) {
      out[entry.key] = entry.persist(state[entry.key] as never);
    }
  }

  return out as Partial<RootState>;
}

function parseWithFallback<T>(
  schema: z.ZodType<T>,
  primary: unknown,
  fallback: unknown,
  merge = false,
): T | undefined {
  const a = schema.safeParse(primary);

  const primaryData =
    a.success && Object.keys(a.data as object).length > 0 ? a.data : undefined;

  if (primaryData && !merge) {
    return primaryData;
  }

  const b = schema.safeParse(fallback);

  const fallbackData =
    b.success && Object.keys(b.data as object).length > 0 ? b.data : undefined;

  // With `merge`, the fallback supplies the base and the primary overrides per
  // key, so a value left behind in the legacy slice fills a key the primary
  // lacks (needed when the primary key predates the migrated field). Otherwise
  // a non-empty primary wins outright.
  if (merge) {
    return primaryData || fallbackData
      ? ({ ...(fallbackData as object), ...(primaryData as object) } as T)
      : undefined;
  }

  return fallbackData;
}
