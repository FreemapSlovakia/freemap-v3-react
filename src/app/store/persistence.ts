import { authInitialState } from '@features/auth/model/reducer.js';
import { UserSchema, UserSettingsSchema } from '@features/auth/model/types.js';
import { cookieConsentInitialState } from '@features/cookieConsent/model/reducer.js';
import {
  DrawingSettingsCompatSchema,
  DrawingStyleSchema,
  drawingSettingsInitialState,
} from '@features/drawing/model/reducers/drawingSettingsReducer.js';
import { GalleryColorizeBySchema } from '@features/gallery/model/actions.js';
import { gallerySettingsInitialState } from '@features/gallery/model/settingsReducer.js';
import { homeLocationInitialState } from '@features/homeLocation/model/reducer.js';
import { l10nInitialState } from '@features/l10n/model/reducer.js';
import { LayerSettingsSchema } from '@features/map/model/actions.js';
import { mapInitialState } from '@features/map/model/reducer.js';
import { mapDetailsInitialState } from '@features/mapDetails/model/reducer.js';
import { MarkerTypeSchema } from '@features/objects/model/actions.js';
import { objectsSettingsInitialState } from '@features/objects/model/settingsReducer.js';
import { ShadingSchema } from '@features/parameterizedShading/model/Shading.js';
import { routePlannerInitialState } from '@features/routePlanner/model/reducer.js';
import { routePlannerSettingsInitialState } from '@features/routePlanner/model/settingsReducer.js';
import { SearchResultStyleSchema } from '@features/search/model/actions.js';
import { searchSettingsInitialState } from '@features/search/model/settingsReducer.js';
import { trackingSettingsInitialState } from '@features/tracking/model/settingsReducer.js';
import { trackViewerSettingsInitialState } from '@features/trackViewer/model/settingsReducer.js';
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
  })
  .partial();

export const PersistedObjectsSettingsSchema = z
  .object({
    selectedIcon: MarkerTypeSchema,
    color: z.string(),
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
  })
  .partial();

export const PersistedSearchSettingsSchema = z
  .object({
    resultStyle: SearchResultStyleSchema.partial(),
  })
  .partial();

export const PersistedTrackViewerSettingsSchema = z
  .object({
    style: DrawingStyleSchema.partial(),
    colorizeTrackBy: ColorizingModeSchema.nullable(),
    colorizeLegend: z.boolean(),
  })
  .partial();

export const PersistedTrackingSettingsSchema = z
  .object(ColorizeSettingsShape)
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

export const PersistedGallerySettingsSchema = z
  .object({
    colorizeBy: GalleryColorizeBySchema.nullable(),
    recentTags: z.array(z.string()),
    showDirection: z.boolean(),
    showLegend: z.boolean(),
    premium: z.boolean(),
  })
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

const PERSIST: PersistEntry[] = [
  defineEntry({
    key: 'map',
    schema: PersistedMapCompatSchema,
    initial: mapInitialState,
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
    persist: (s) => ({ hiddenInfoBars: s.hiddenInfoBars }),
  }),
  defineEntry({
    key: 'objectsSettings',
    schema: PersistedObjectsSettingsSchema,
    initial: objectsSettingsInitialState,
    persist: (o) => ({ selectedIcon: o.selectedIcon, color: o.color }),
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
    key: 'trackViewerSettings',
    schema: PersistedTrackViewerSettingsSchema,
    initial: trackViewerSettingsInitialState,
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
    key: 'trackingSettings',
    schema: PersistedTrackingSettingsSchema,
    initial: trackingSettingsInitialState,
    // Also read these prefs from the `tracking` blob, which can carry them.
    fallbackKey: 'tracking',
    persist: (t) => ({
      colorizeBy: t.colorizeBy,
      colorizeLegend: t.colorizeLegend,
    }),
  }),
  defineEntry({
    key: 'mapDetails',
    schema: PersistedMapDetailsSchema,
    initial: mapDetailsInitialState,
    persist: (m) => ({ excludeSources: m.excludeSources }),
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
];

export function getInitialState(): Partial<RootState> {
  let persisted: Partial<Record<keyof RootState, unknown>>;

  try {
    persisted = JSON.parse(storage.getItem('store') ?? '{}');
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
