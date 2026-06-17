import { authInitialState } from '@features/auth/model/reducer.js';
import { UserSchema, UserSettingsSchema } from '@features/auth/model/types.js';
import { cookieConsentInitialState } from '@features/cookieConsent/model/reducer.js';
import {
  DrawingSettingsCompatSchema,
  drawingSettingsInitialState,
} from '@features/drawing/model/reducers/drawingSettingsReducer.js';
import { GalleryColorizeBySchema } from '@features/gallery/model/actions.js';
import { galleryInitialState } from '@features/gallery/model/reducer.js';
import { homeLocationInitialState } from '@features/homeLocation/model/reducer.js';
import { l10nInitialState } from '@features/l10n/model/reducer.js';
import { LayerSettingsSchema } from '@features/map/model/actions.js';
import { mapInitialState } from '@features/map/model/reducer.js';
import { mapDetailsInitialState } from '@features/mapDetails/model/reducer.js';
import { MarkerTypeSchema } from '@features/objects/model/actions.js';
import { objectInitialState } from '@features/objects/model/reducer.js';
import { ShadingSchema } from '@features/parameterizedShading/model/Shading.js';
import { routePlannerInitialState } from '@features/routePlanner/model/reducer.js';
import { ColorizingModeSchema } from '@features/trackViewer/model/actions.js';
import { trackViewerInitialState } from '@features/trackViewer/model/reducer.js';
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

export const PersistedObjectsSchema = z
  .object({
    selectedIcon: MarkerTypeSchema,
  })
  .partial();

export const PersistedRoutePlannerSchema = z
  .object({
    preventHint: z.boolean(),
    transportType: TransportTypeCompatSchema,
    milestones: z.union([z.literal('abs'), z.literal('rel'), z.literal(false)]),
  })
  .partial();

export const PersistedTrackViewerSchema = z
  .object({
    colorizeTrackBy: ColorizingModeSchema.nullable(),
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

export const PersistedGallerySchema = z
  .object({
    colorizeBy: GalleryColorizeBySchema.nullable(),
    showDirection: z.boolean(),
    showLegend: z.boolean(),
    recentTags: z.array(z.string()),
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
    key: 'objects',
    schema: PersistedObjectsSchema,
    initial: objectInitialState,
    persist: (o) => ({ selectedIcon: o.selectedIcon }),
  }),
  defineEntry({
    key: 'routePlanner',
    schema: PersistedRoutePlannerSchema,
    initial: routePlannerInitialState,
    persist: (r) => ({
      preventHint: r.preventHint,
      transportType: r.transportType,
      milestones: r.milestones,
    }),
  }),
  defineEntry({
    key: 'trackViewer',
    schema: PersistedTrackViewerSchema,
    initial: trackViewerInitialState,
    persist: (t) => ({ colorizeTrackBy: t.colorizeTrackBy }),
  }),
  defineEntry({
    key: 'mapDetails',
    schema: PersistedMapDetailsSchema,
    initial: mapDetailsInitialState,
    persist: (m) => ({ excludeSources: m.excludeSources }),
  }),
  defineEntry({
    key: 'gallery',
    schema: PersistedGallerySchema,
    initial: galleryInitialState,
    persist: (g) => ({
      colorizeBy: g.colorizeBy,
      showDirection: g.showDirection,
      showLegend: g.showLegend,
      recentTags: g.recentTags,
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
      data = parseWithFallback(entry.schema, raw, persisted[entry.fallbackKey]);
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
): T | undefined {
  const a = schema.safeParse(primary);

  if (a.success && Object.keys(a.data as object).length > 0) {
    return a.data;
  }

  const b = schema.safeParse(fallback);

  return b.success && Object.keys(b.data as object).length > 0
    ? b.data
    : undefined;
}
