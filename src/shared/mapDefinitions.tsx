import {
  type Shading,
  type Color as ShadingColor,
  serializeShading,
} from '@features/parameterizedShading/model/Shading.js';
import { currentSite, siteNames, siteUrls } from '@shared/sites.js';
import { type Shortcut, ShortcutSchema } from '@shared/types/common.js';
import type { ReactElement } from 'react';
import z from 'zod';

export interface AttributionDef {
  type: 'map' | 'data' | 'photos' | 'routing';
  name?: string;
  nameKey?:
    | 'osmData'
    | 'fixTheMap'
    | 'freemap'
    | 'srtm'
    | 'maptiler'
    | 'outdoorShadingAttribution'
    | 'photosCc';
  url?: string;
  country?: string;
}

export const OSM_MAP_ATTR: AttributionDef = {
  type: 'map',
  name: '©\xa0OpenStreetMap',
  url: 'https://osm.org/',
};

export const OSM_DATA_ATTR: AttributionDef = {
  type: 'data',
  nameKey: 'osmData',
  url: 'https://osm.org/copyright',
};

/**
 * Follows {@link OSRM_ROUTING_ATTR} wherever it is shown as a link — a condition
 * of the FOSSGIS services the OSRM profiles route through.
 */
export const FIXTHEMAP_ATTR: AttributionDef = {
  type: 'data',
  nameKey: 'fixTheMap',
  url: 'https://www.openstreetmap.org/fixthemap',
};

/**
 * The volunteers whose server answers the OSRM profiles. Their terms ask for the
 * data's credit rather than their own, so this is courtesy — the GraphHopper
 * ones are ours to run, and only these are somebody's donated time.
 */
export const OSRM_ROUTING_ATTR: AttributionDef = {
  type: 'routing',
  name: 'OSRM / FOSSGIS e.\xa0V.',
  url: 'https://routing.openstreetmap.de/about.html',
};

/**
 * The portal serving this build. The same bundle answers on both domains, and
 * the map is credited to the one the reader is on.
 */
const site = currentSite;

export const FM_ATTR: AttributionDef = {
  type: 'map',
  name: `©\xa0${siteNames[site]}`,
  url: siteUrls[site],
};

export const NLC_ATTR: AttributionDef = {
  type: 'map',
  name: '©\xa0NLC Zvolen',
  url: 'http://www.nlcsk.org/',
  country: 'sk',
};

export const GKU_ATTR: AttributionDef = {
  type: 'map',
  name: '©\xa0GKÚ',
  url: 'https://www.gku.sk/',
  country: 'sk',
};

export const GEOLOGY_ATTR: AttributionDef = {
  type: 'map',
  name: '© Štátny geologický ústav Dionýza Štúra',
  country: 'sk',
  url: 'http://www.geology.sk',
};

export const CUZK_ATTR: AttributionDef = {
  type: 'map',
  name: '©\xa0ČÚZK',
  url: 'https://geoportal.cuzk.cz/',
  country: 'cz',
};

/**
 * The pan-European radar composite behind the weather layer. The national
 * services that feed it — SHMÚ among them — are credited through the programme
 * they contribute the data to.
 */
export const OPERA_ATTR: AttributionDef = {
  type: 'data',
  name: 'EUMETNET OPERA',
  url: 'https://www.eumetnet.eu/observations/weather-radar-network/',
};

/**
 * The radar data is CC-BY-4.0 everywhere except over Italy, where the national
 * composite is CC-BY-SA-4.0 and asks to be credited by this name — so it is
 * credited on its own, only where a tile can carry it.
 */
export const DPC_RADAR_ATTR: AttributionDef = {
  type: 'data',
  name: 'Radar-DPC (CC\xa0BY-SA\xa04.0)',
  url: 'https://www.protezionecivile.gov.it/',
  country: 'it',
};

export const LLS_URL =
  'https://www.skgeodesy.sk/gku/produkty-sluzby/na-stiahnutie/zbgis.html#lls';

export const OFM_URL =
  'https://www.skgeodesy.sk/gku/produkty-sluzby/na-stiahnutie/zbgis.html#ortofoto';

export const OFM_ATTR: AttributionDef = {
  type: 'map',
  name: '©\xa0GKÚ, NLC',
  url: OFM_URL,
  country: 'sk',
};

export const TERRAIN_TILES_URL = process.env['FM_TERRAIN_TILES_URL'];

/** Tiles of `shading` rendered on the server. */
export const serverShadingUrl = (shading: Shading) =>
  `${TERRAIN_TILES_URL}/hillshade/{z}/{x}/{y}?format=webp&shading=${encodeURIComponent(
    serializeShading(shading),
  )}`;

/**
 * The renderer's layers whose tiles name the datasets they drew. Its overlays
 * credit only Freemap and OSM, so they are left out and load as plain images.
 */
export const RENDERER_LAYER_TYPES = ['X', 'XK'];

const RENDERER_ROUTE_BY_TYPE = {
  X: '/',
  XK: '/kst',
  xs: '/o/sac',
  xq: '/o/smoothness',
  xm: '/o/mtb',
  xh: '/o/hiking',
  xb: '/o/bicycle',
  xl: '/o/ski',
  xr: '/o/horse',
  xa: '/o/aerial',
} as const;

/**
 * The renderer's tile route behind each layer it serves, as its legend's
 * `?variant=` names it.
 */
export const RENDERER_ROUTES: Readonly<Record<string, string>> =
  RENDERER_ROUTE_BY_TYPE;

export const rendererTileUrl = (type: keyof typeof RENDERER_ROUTE_BY_TYPE) => {
  const route = RENDERER_ROUTE_BY_TYPE[type];

  return `${process.env['FM_MAPSERVER_URL']}${route === '/' ? '' : route}/{z}/{x}/{y}`;
};

// bbox of freemap-outdoor-map/limit-europe-buffered.geojson (the renderer's
// coverage polygon), rounded — the "zoom to coverage" target
export const OUTDOOR_BBOX: [number, number, number, number] = [
  -33.22, 28.97, 47.16, 81.17,
];

/**
 * Where the outdoor renderer draws, and so the universe
 * `/geotools/covered-countries` can answer from. A dataset key outside it —
 * `en`, which is not a country code — cannot be matched against what is in
 * view, and is credited everywhere rather than nowhere.
 */
export const OUTDOOR_COUNTRIES = [
  'ad',
  'al',
  'at',
  'ba',
  'be',
  'bg',
  'by',
  'ch',
  'cy',
  'cz',
  'de',
  'dk',
  'ee',
  'es',
  'fi',
  'fo',
  'fr',
  'gb',
  'gr',
  'hr',
  'hu',
  'ie',
  'is',
  'it',
  'lt',
  'lu',
  'lv',
  'md',
  'me',
  'mk',
  'nl',
  'no',
  'pl',
  'pt',
  'ro',
  'rs',
  'se',
  'si',
  'sk',
  'sm',
  'tr',
  'ua',
  'va',
  'xk',
];

export const RENDERER_COUNTRIES: ReadonlySet<string> = new Set(
  OUTDOOR_COUNTRIES,
);

/** The countries to flag beside a layer's name; none for a Europe-wide one. */
export const flaggedCountries = (def: {
  countries?: string[];
}): string[] | undefined =>
  def.countries === OUTDOOR_COUNTRIES ? undefined : def.countries;

/**
 * What the outdoor map and its KST-routes variant credit before their tiles are
 * heard from: the two that are ours to name whatever the renderer answers, and
 * that stand even when it cannot be reached at all. Every terrain source comes
 * from the renderer itself — see `tileAttribution.ts`.
 */
export const OUTDOOR_ATTRIBUTION: AttributionDef[] = [FM_ATTR, OSM_DATA_ATTR];

// The terrain models behind a viewshed are not here: the service names the ones
// its render was answered from, and `Attribution` adds those. A render reaches
// 300 km, so the countries in view cannot stand in for them.
export const VIEWSHED_ATTRIBUTION: AttributionDef[] = [FM_ATTR];

export type HasUrl = {
  url: string;
};

export type HasMaxNativeZoom = {
  maxNativeZoom?: number;
};

type HasZIndex = {
  zIndex?: number;
};

export type IsIntegratedLayerDef = {
  /** A catalog map's own name; a built-in map's is translated. */
  name?: string;
  /** An Editor Layer Index category (`photo`, `historicmap`, …), as the library filters by. */
  category?: string;
  /** False for a map offered in the library but not installed until asked for. */
  defaultInstalled?: boolean;
  layerPreview?: boolean;
  /**
   * Opacity this overlay is drawn at until the user sets one of their own.
   * For a layer whose whole point is to be read against the map underneath.
   */
  defaultOpacity?: number;
  icon: ReactElement;
  premiumFromZoom?: number;
  experimental?: boolean;
  attribution: AttributionDef[];
  countries?: string[];
  defaultInToolbar?: boolean;
  defaultInMenu?: boolean;
};

export type HasScaleWithDpi = {
  scaleWithDpi?: boolean;
};

export type IsCommonLayerDef = {
  type: string;
  minZoom?: number;
  shortcut?: Shortcut;
  /**
   * Extent the layer covers, as [west, south, east, north]. Used only as the
   * "zoom to coverage" target for a layer whose coverage isn't captured by the
   * per-country boxes (e.g. a multi-country layer). Country-limited national
   * layers derive their target from `countries` instead.
   */
  bbox?: [number, number, number, number];
  /** A coverage in parts far apart, a box each; `bbox` is then the largest. */
  bboxes?: [number, number, number, number][];
};

type IsParametricShadingLayerDef = HasUrl &
  HasMaxNativeZoom &
  HasZIndex &
  HasScaleWithDpi & {
    technology: 'parametricShading';
  };

/** One colour all over: a blank base map, or a tint as an overlay. */
type IsColorLayerDef = HasZIndex & {
  technology: 'color';
  /** Until the layer's setup picks one. */
  color: ShadingColor;
};

type IsGalleryLayerDef = HasZIndex & {
  technology: 'gallery';
};

type IsWikipediaLayerDef = HasZIndex & {
  technology: 'wikipedia';
};

type IsInteractiveLayerDef = {
  technology: 'interactive';
};

/**
 * Animated precipitation radar. Its own technology because a frame's timestamp
 * is part of the tile URL, so the layer is a series of tile layers the feature
 * cross-fades rather than the one a `tile` def describes.
 */
type IsRadarLayerDef = HasMaxNativeZoom &
  HasZIndex & {
    technology: 'radar';
  };

/**
 * What can be seen from one point, as a single image the terrain service
 * renders per viewpoint. Its own technology because it is not a grid of tiles
 * at all — see `doc/viewshed.md`.
 */
type IsViewshedLayerDef = HasZIndex & {
  technology: 'viewshed';
};

export type IsWmsLayerDef = HasUrl &
  HasZIndex &
  HasMaxNativeZoom & {
    technology: 'wms';
    /** Drawn until the layer's setup ticks others. */
    layers: string[];
    /**
     * Go back to a grid of tiles instead of one image per settled view. Needed
     * for a server that caps the image size below what a viewport asks for, or
     * one behind a tile cache that only repeated tile URLs can hit; the price is
     * a burst of requests per view and labels clipped at the tile seams.
     */
    tiled?: boolean;
  };

type IsMapLibreLayerDef = HasUrl & {
  technology: 'maplibre';
};

export type IsTileLayerDef = HasUrl &
  HasMaxNativeZoom &
  HasZIndex &
  HasScaleWithDpi & {
    technology: 'tile';
    subdomains?: string | string[];
    tms?: boolean;
    extraScales?: number[];
    errorTileUrl?: string;
    cors?: boolean;
  };

/**
 * Sharper tiles drawn over the layer's own where `coverageUrl` says they have
 * data; a partially covered tile must be transparent where it has none.
 */
export type TileDetailDef = {
  url: string;
  coverageUrl: string;
  maxNativeZoom: number;
  /** Premium applies to the detail only; the layer's own tiles stay free. */
  premiumFromZoom?: number;
  /** The layer's own `attribution` credits only its own tiles. */
  attribution: AttributionDef[];
};

/**
 * What the offline export renders for a layer that isn't exported as itself:
 * the API's map `type`, covering only `countries`.
 */
export type OfflineExportDef = {
  type: string;
  url: string;
  minZoom: number;
  maxNativeZoom: number;
  creditsPerMTile: number;
  countries: string[];
};

export type IsBaseLayerDef = {
  layer: 'base';
};

export type IsOverlayLayerDef = HasZIndex & {
  layer: 'overlay';
};

// The [west, south, east, north] extent a layer covers, or undefined. Cached
// maps store their actual downloaded extent under `bounds`, which wins over any
// `bbox` inherited from the source layer; declarative layers use `bbox`.
/**
 * The opacity a layer is drawn at: the user's own setting if they have one,
 * otherwise, for an overlay, whatever the layer asks for, otherwise opaque. A
 * base map switched from an overlay doesn't take the overlay's default.
 */
export const resolveLayerOpacity = (
  def: object | undefined,
  opacity: number | undefined,
): number =>
  opacity ??
  (def &&
  !('layer' in def && def.layer === 'base') &&
  'defaultOpacity' in def &&
  typeof def.defaultOpacity === 'number'
    ? def.defaultOpacity
    : 1);

/** The one built-in shading layer, whose terrain every custom shading map draws. */
export const SHADING_SOURCE = 'h';

export const getLayerBbox = (
  def: object,
): [number, number, number, number] | undefined => {
  const box =
    'bounds' in def ? def.bounds : 'bbox' in def ? def.bbox : undefined;

  return Array.isArray(box) && box.length === 4
    ? (box as [number, number, number, number])
    : undefined;
};

// Rough [west, south, east, north] extents used only as a "zoom to" target for
// country-limited layers; actual coverage is tested against real borders via
// the covered-countries service, not these rectangles.
const COUNTRY_BBOXES: Record<string, [number, number, number, number]> = {
  sk: [16.83, 47.73, 22.57, 49.61],
  cz: [12.09, 48.55, 18.86, 51.06],
};

/** Union bbox of the known country extents, or undefined if none are known. */
export const getCountriesBbox = (
  countries?: string[],
): [number, number, number, number] | undefined => {
  let west = Infinity;
  let south = Infinity;
  let east = -Infinity;
  let north = -Infinity;

  for (const country of countries ?? []) {
    const box = COUNTRY_BBOXES[country];

    if (box) {
      west = Math.min(west, box[0]);
      south = Math.min(south, box[1]);
      east = Math.max(east, box[2]);
      north = Math.max(north, box[3]);
    }
  }

  return Number.isFinite(west) ? [west, south, east, north] : undefined;
};

export const isTileLayerDef = <T extends { technology: string }>(
  def: T,
): def is T & IsTileLayerDef => def.technology === 'tile';

export const isWmsLayerDef = <T extends { technology: string }>(
  def: T,
): def is T & IsWmsLayerDef => def.technology === 'wms';

// HasMaxNativeZoom is structural-only (the field is optional) — any object
// matches it. Including it in the predicate's return type just lets callers
// read def.maxNativeZoom without a TS error.
export const isBaseLayerDef = <T extends { layer: string }>(
  def: T,
): def is T & IsBaseLayerDef & HasMaxNativeZoom => def.layer === 'base';

export type IsAllTechnologiesLayerDef =
  | (IsTileLayerDef & {
      creditsPerMTile?: number;
      detail?: TileDetailDef;
      offlineExport?: OfflineExportDef;
    })
  | IsWmsLayerDef
  | IsMapLibreLayerDef
  | IsParametricShadingLayerDef
  | IsColorLayerDef
  | IsGalleryLayerDef
  | IsInteractiveLayerDef
  | IsWikipediaLayerDef
  | IsRadarLayerDef
  | IsViewshedLayerDef;

export type IsCustomLayer = {
  name?: string;
  /** A named map's library map, resolved; see `NamedMapDef`. */
  source?: string;
  /** As the library filters by; see `categoryGroup`. */
  category?: string;
  /**
   * The layer's icon as a `drawingIcons` spec (`fa:<name>` / `poi:<name>`).
   * A string rather than the integrated registry's `ReactElement` so it can be
   * persisted; missing means its type's icon (`CustomMapGlyph`).
   */
  iconSpec?: string;
};

/** What a custom map may be: a server the user adds. */
export type IsCustomLayerTechnologiesDef =
  | IsTileLayerDef
  | IsWmsLayerDef
  | IsMapLibreLayerDef;

export type CustomBaseLayerDef<
  T extends IsCustomLayerTechnologiesDef = IsCustomLayerTechnologiesDef,
> = IsCustomLayer & T & IsBaseLayerDef & IsCommonLayerDef;

export type CustomOverlayLayerDef<
  T extends IsCustomLayerTechnologiesDef = IsCustomLayerTechnologiesDef,
> = IsCustomLayer & T & IsOverlayLayerDef & IsCommonLayerDef;

export type CustomLayerDef<
  T extends IsCustomLayerTechnologiesDef = IsCustomLayerTechnologiesDef,
> = CustomBaseLayerDef<T> | CustomOverlayLayerDef<T>;

const IsCommonLayerDefSchema = z.object({
  type: z.string(),
  minZoom: z.number().optional(),
  shortcut: ShortcutSchema.optional(),
  bbox: z.tuple([z.number(), z.number(), z.number(), z.number()]).optional(),
});

const IsCustomLayerSchema = z.object({
  name: z.string().optional(),
  category: z.string().optional(),
  iconSpec: z.string().optional(),
});

export const IsTileLayerDefSchema = z.object({
  technology: z.literal('tile'),
  url: z.string(),
  maxNativeZoom: z.number().optional(),
  zIndex: z.number().optional(),
  scaleWithDpi: z.boolean().optional(),
  subdomains: z.union([z.string(), z.array(z.string())]).optional(),
  tms: z.boolean().optional(),
  extraScales: z.array(z.number()).optional(),
  errorTileUrl: z.string().optional(),
  cors: z.boolean().optional(),
});

export const IsWmsLayerDefSchema = z.object({
  technology: z.literal('wms'),
  url: z.string(),
  layers: z.array(z.string()),
  maxNativeZoom: z.number().optional(),
  zIndex: z.number().optional(),
  tiled: z.boolean().optional(),
});

export const IsMapLibreLayerDefSchema = z.object({
  technology: z.literal('maplibre'),
  url: z.string(),
});

export const IsCustomLayerTechnologiesDefSchema = z.discriminatedUnion(
  'technology',
  [IsTileLayerDefSchema, IsWmsLayerDefSchema, IsMapLibreLayerDefSchema],
);

export const CustomLayerDefGenericSchema = <
  T extends z.ZodType<IsCustomLayerTechnologiesDef>,
>(
  technologySchema: T,
) =>
  z.intersection(
    z.discriminatedUnion('layer', [
      z.object({
        ...IsCustomLayerSchema.shape,
        ...IsCommonLayerDefSchema.shape,
        layer: z.literal('base'),
      }),
      z.object({
        ...IsCustomLayerSchema.shape,
        ...IsCommonLayerDefSchema.shape,
        layer: z.literal('overlay'),
        zIndex: z.number().optional(),
      }),
    ]),
    technologySchema,
  );

export const CustomLayerDefSchema = CustomLayerDefGenericSchema(
  IsCustomLayerTechnologiesDefSchema,
);

export type HasLegacy = {
  superseededBy?: string;
};

export type IntegratedBaseLayerDef<
  T extends IsAllTechnologiesLayerDef = IsAllTechnologiesLayerDef,
> = T & IsCommonLayerDef & IsIntegratedLayerDef & IsBaseLayerDef & HasLegacy;

export type IntegratedOverlayLayerDef<
  T extends IsAllTechnologiesLayerDef = IsAllTechnologiesLayerDef,
> = T & IsCommonLayerDef & IsIntegratedLayerDef & IsOverlayLayerDef & HasLegacy;

export type IntegratedLayerDef<
  T extends IsAllTechnologiesLayerDef = IsAllTechnologiesLayerDef,
> = IntegratedBaseLayerDef<T> | IntegratedOverlayLayerDef<T>;

export type BaseLayerDef = IntegratedBaseLayerDef | CustomBaseLayerDef;

export type OverlayLayerDef = IntegratedOverlayLayerDef | CustomOverlayLayerDef;

export type LayerDef<
  U extends IsCustomLayerTechnologiesDef = IsCustomLayerTechnologiesDef,
  V extends IsAllTechnologiesLayerDef = IsAllTechnologiesLayerDef,
> = CustomLayerDef<U> | IntegratedLayerDef<V>;

// Legacy custom layer shape: tile-layer fields without the `layer` /
// `technology` discriminators that the current schema requires.
const OldTileCustomLayerDefSchema = z.object({
  ...IsCustomLayerSchema.shape,
  ...IsCommonLayerDefSchema.shape,
  url: z.string(),
  maxNativeZoom: z.number().optional(),
  zIndex: z.number().optional(),
  scaleWithDpi: z.boolean().optional(),
  subdomains: z.union([z.string(), z.array(z.string())]).optional(),
  tms: z.boolean().optional(),
  extraScales: z.array(z.number()).optional(),
  errorTileUrl: z.string().optional(),
  cors: z.boolean().optional(),
});

/**
 * A map the user names: a library map (`source`) drawn with its own shading,
 * WMS layers or colour, which its setup holds as any map's does.
 */
export type NamedMapDef = IsCustomLayer &
  IsCommonLayerDef & {
    layer: 'base' | 'overlay';
    source: string;
  };

export const NamedMapDefSchema = z.object({
  ...IsCustomLayerSchema.shape,
  ...IsCommonLayerDefSchema.shape,
  layer: z.enum(['base', 'overlay']),
  source: z.string(),
});

/** What the custom-map list holds: maps the user adds and maps they name. */
export type StoredCustomLayerDef = CustomLayerDef | NamedMapDef;

export const isNamedMapDef = (def: StoredCustomLayerDef): def is NamedMapDef =>
  !('technology' in def);

export const CustomLayerDefArrayCompatSchema = z
  .array(z.unknown())
  .transform((defs) =>
    defs.flatMap<StoredCustomLayerDef>((def) => {
      if (
        typeof def === 'object' &&
        def !== null &&
        !('technology' in def) &&
        'source' in def
      ) {
        const named = NamedMapDefSchema.safeParse(def);

        return named.success ? [named.data] : [];
      }

      const ok = CustomLayerDefSchema.safeParse(def);

      if (ok.success) {
        return [ok.data];
      }

      const old = OldTileCustomLayerDefSchema.safeParse(def);

      if (old.success) {
        const upgraded = CustomLayerDefSchema.safeParse({
          ...old.data,
          layer: old.data.type.charAt(0) === ':' ? 'overlay' : 'base',
          technology: 'tile',
        });

        if (upgraded.success) {
          return [upgraded.data];
        }
      }

      return [];
    }),
  );

/**
 * Removed layers and the ones that replaced them, for ids still arriving from
 * old links and stored state.
 */
export const LAYER_ALIASES: Readonly<Record<string, readonly string[]>> = {
  y: ['h'],
  z: ['h'],
  // `S` draws the same orthophoto where it has data.
  Z: ['S'],
  '5': ['h'],
  '8': ['h'],
};

/**
 * Removed layers a cached map may still name as its source: what it takes from
 * the source layer, which the registry no longer has.
 */
export const RETIRED_SOURCE_LAYERS: Readonly<
  Record<
    string,
    {
      minZoom: number;
      maxNativeZoom: number;
      premiumFromZoom?: number;
      scaleWithDpi?: boolean;
      attribution: AttributionDef[];
    }
  >
> = {
  Z: {
    minZoom: 0,
    maxNativeZoom: 20,
    premiumFromZoom: 20,
    scaleWithDpi: true,
    attribution: [OFM_ATTR, CUZK_ATTR],
  },
};

/** A layer id, or the ids of the layers that replaced a removed one. */
export const resolveLayerAlias = (layer: string): readonly string[] =>
  LAYER_ALIASES[layer] ?? [layer];

/** Layer ids with removed ones mapped to their replacements, deduplicated. */
export const resolveLayerAliases = (layers: readonly string[]): string[] => [
  ...new Set(layers.flatMap(resolveLayerAlias)),
];

/**
 * Per-layer settings with a removed layer's moved to the overlay that replaced
 * it (the alias's last id), unless that one has its own.
 */
export function resolveLayersSettingsAliases<T>(
  settings: Readonly<Record<string, T>>,
): Record<string, T> {
  const out = { ...settings };

  for (const [from, to] of Object.entries(LAYER_ALIASES)) {
    const setting = out[from];

    if (setting !== undefined) {
      delete out[from];

      out[to[to.length - 1]] ??= setting;
    }
  }

  return out;
}

/** The fields the library index carries for every map; the rest is loaded per map. */
type MapIndexField =
  | 'type'
  | 'name'
  | 'category'
  | 'defaultInstalled'
  | 'layer'
  | 'technology'
  | 'icon'
  | 'countries'
  | 'bbox'
  | 'bboxes'
  | 'shortcut'
  | 'defaultInMenu'
  | 'defaultInToolbar'
  | 'superseededBy'
  | 'experimental'
  | 'layerPreview';

type DistributiveOmit<T, K extends PropertyKey> = T extends unknown
  ? Omit<T, K>
  : never;

export type LayerTechnology = IntegratedLayerDef['technology'];

/** A library map's own file: what the index doesn't carry. */
export type MapBody<T extends LayerTechnology = LayerTechnology> =
  DistributiveOmit<
    Extract<IntegratedLayerDef, { technology: T }>,
    MapIndexField
  >;

/** A library map as the index knows it, before its body is loaded. */
export type MapIndexEntry<T extends LayerTechnology = LayerTechnology> = Pick<
  IntegratedLayerDef,
  Exclude<MapIndexField, 'technology'>
> & {
  technology: T;
  load: () => Promise<MapBody<T>>;
  /** The body, for a map in the main bundle: there from the first render. */
  bundled?: MapBody<T>;
};
