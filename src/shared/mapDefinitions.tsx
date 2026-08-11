import { type Shortcut, ShortcutSchema } from '@shared/types/common.js';
import type { ReactElement } from 'react';
import {
  FaBus,
  FaCamera,
  FaCloudShowersHeavy,
  FaHiking,
  FaMap,
  FaPencilAlt,
  FaPlane,
  FaTractor,
  FaTree,
  FaWater,
  FaWikipediaW,
} from 'react-icons/fa';
import { GiHills, GiStonePile, GiTreasureMap } from 'react-icons/gi';
import { LuLandPlot } from 'react-icons/lu';
import { SiOpenstreetmap } from 'react-icons/si';
import z from 'zod';
import black1x1 from '@/images/1x1-black.png';
import transparent1x1 from '@/images/1x1-transparent.png';
import white1x1 from '@/images/1x1-white.png';

export interface AttributionDef {
  type: 'map' | 'data' | 'photos';
  name?: string;
  nameKey?:
    | 'osmData'
    | 'freemap'
    | 'srtm'
    | 'maptiler'
    | 'outdoorShadingAttribution'
    | 'photosCc';
  url?: string;
  country?: string;
  /**
   * Marks a global source that national data supersedes: it is shown only when
   * the covered area reaches beyond the listed countries.
   */
  exceptCountries?: string[];
}

const OSM_MAP_ATTR: AttributionDef = {
  type: 'map',
  name: '©\xa0OpenStreetMap',
  url: 'https://osm.org/',
};

const OSM_DATA_ATTR: AttributionDef = {
  type: 'data',
  nameKey: 'osmData',
  url: 'https://osm.org/copyright',
};

const FM_ATTR: AttributionDef = {
  type: 'map',
  name: '©\xa0Freemap Slovakia',
  url: 'https://www.freemap.sk',
};

const NLC_ATTR: AttributionDef = {
  type: 'map',
  name: '©\xa0NLC Zvolen',
  url: 'http://www.nlcsk.org/',
  country: 'sk',
};

const GKU_ATTR: AttributionDef = {
  type: 'map',
  name: '©\xa0GKÚ',
  url: 'https://www.gku.sk/',
  country: 'sk',
};

const GEOLOGY_ATTR: AttributionDef = {
  type: 'map',
  name: '© Štátny geologický ústav Dionýza Štúra',
  country: 'sk',
  url: 'http://www.geology.sk',
};

const CUZK_ATTR: AttributionDef = {
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
const OPERA_ATTR: AttributionDef = {
  type: 'data',
  name: 'EUMETNET OPERA',
  url: 'https://www.eumetnet.eu/observations/weather-radar-network/',
};

/**
 * The radar data is CC-BY-4.0 everywhere except over Italy, where the national
 * composite is CC-BY-SA-4.0 and asks to be credited by this name — so it is
 * credited on its own, only where a tile can carry it.
 */
const DPC_RADAR_ATTR: AttributionDef = {
  type: 'data',
  name: 'Radar-DPC (CC\xa0BY-SA\xa04.0)',
  url: 'https://www.protezionecivile.gov.it/',
  country: 'it',
};

const LLS_URL =
  'https://www.skgeodesy.sk/gku/produkty-sluzby/na-stiahnutie/zbgis.html#lls';

const OFM_URL =
  'https://www.skgeodesy.sk/gku/produkty-sluzby/na-stiahnutie/zbgis.html#ortofoto';

const GEDTM30_URL = 'https://codeberg.org/openlandmap/GEDTM30';

/**
 * The global terrain model everything without a national one falls back to —
 * both for the outdoor renderer's shading and for the elevation API (see
 * `elevationSources.ts`). Add `exceptCountries` where the national sources are
 * credited beside it, so it shows only past their coverage.
 */
export const GEDTM30_ATTR: AttributionDef = {
  type: 'data',
  name: 'GEDTM30',
  url: GEDTM30_URL,
};

/**
 * Every national elevation/relief source the outdoor renderer blends in;
 * countries missing from this list fall back to GEDTM30. The elevation API
 * answers from the same models, for the countries in
 * `ELEVATION_API_DTM_COUNTRIES` — its own list, which need not match this one.
 */
export const OUTDOOR_NATIONAL_DTM_ATTRIBUTION: (AttributionDef & {
  country: string;
})[] = [
  {
    type: 'data',
    country: 'at',
    name: 'ALS DTM: Digitales Geländemodell Österreich (Geoland.at open data)',
    url: 'https://www.data.gv.at/katalog/dataset/d88a1246-9684-480b-a480-ff63286b35b7',
  },
  {
    type: 'data',
    country: 'cz',
    name: 'DMR 5G: ČÚZK Geoportál',
    url: 'https://geoportal.cuzk.cz/(S(a21rqp1jhcnkz4iqcen2w50l))/Default.aspx?head_tab=sekce-02-gp&lng=EN&menu=302&metadataID=CZ-CUZK-DMR5G-V&mode=TextMeta&side=vyskopis',
  },
  {
    type: 'data',
    country: 'fr',
    name: 'RGE ALTI: IGN (Etalab Open Licence)',
    url: 'https://geoservices.ign.fr/rgealti',
  },
  {
    type: 'data',
    country: 'it',
    name: 'HR-DTM 5 m: IRPI-CNR',
    url: 'https://doi.org/10.5281/zenodo.18335145',
  },
  {
    type: 'data',
    country: 'pl',
    name: 'NMT: GUGiK',
    url: 'https://www.geoportal.gov.pl/',
  },
  {
    type: 'data',
    country: 'sk',
    name: 'DMR 5.0: ÚGKK SR',
    url: LLS_URL,
  },
  {
    type: 'data',
    country: 'si',
    name: 'DMR: Ministrstvo za okolje in prostor',
    url: 'https://gis.arso.gov.si/evode/profile.aspx?id=atlas_voda_Lidar@Arso',
  },
  {
    type: 'data',
    country: 'ch',
    name: 'swissALTI3D: © swisstopo',
    url: 'https://www.swisstopo.admin.ch/en/height-models/swissalti3d.html',
  },
  {
    type: 'data',
    country: 'no',
    name: 'DTM: Kartverket (NLOD\xa02.0)',
    url: 'https://hoydedata.no/',
  },
  {
    type: 'data',
    country: 'se',
    name: 'Markhöjdmodell Nedladdning: Lantmäteriet',
    url: 'https://www.lantmateriet.se/en/geodata/our-products/product-list/elevation-model-download/',
  },
  {
    type: 'data',
    country: 'fi',
    name: 'Korkeusmalli 2 m: Maanmittauslaitos',
    url: 'https://www.maanmittauslaitos.fi/en/maps-and-spatial-data/datasets-and-interfaces/product-descriptions/elevation-model-2-m',
  },
  {
    type: 'data',
    country: 'es',
    name: 'MDT05: IGN (CNIG)',
    url: 'https://centrodedescargas.cnig.es/CentroDescargas/modelos-digitales-elevaciones',
  },
  {
    type: 'data',
    country: 'hr',
    name: 'DMR: Državna geodetska uprava',
    url: 'https://dgu.gov.hr/proizvodi-i-usluge/podaci-topografske-izmjere/digitalni-model-reljefa/180',
  },
];

/**
 * Countries the outdoor renderer shades from a national elevation model. The
 * elevation API keeps its own list, `ELEVATION_API_DTM_COUNTRIES`, which need
 * not hold the same countries.
 */
const OUTDOOR_NATIONAL_DTM_COUNTRIES = OUTDOOR_NATIONAL_DTM_ATTRIBUTION.map(
  (a) => a.country,
);

// Attribution shared by the outdoor map and its KST-routes variant: Freemap,
// OSM data, the national elevation sources, and the global GEDTM30 model that
// covers everywhere else.
const OUTDOOR_ATTRIBUTION: AttributionDef[] = [
  FM_ATTR,
  OSM_DATA_ATTR,
  ...OUTDOOR_NATIONAL_DTM_ATTRIBUTION,
  { ...GEDTM30_ATTR, exceptCountries: OUTDOOR_NATIONAL_DTM_COUNTRIES },
];

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
};

type IsParametricShadingLayerDef = HasUrl &
  HasMaxNativeZoom &
  HasZIndex &
  HasScaleWithDpi & {
    technology: 'parametricShading';
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

export type IsWmsLayerDef = HasUrl &
  HasZIndex &
  HasMaxNativeZoom & {
    technology: 'wms';
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
 * The opacity an overlay is drawn at: the user's own setting if they have one,
 * otherwise whatever the layer asks for, otherwise opaque.
 */
export const resolveLayerOpacity = (
  def: object | undefined,
  opacity: number | undefined,
): number =>
  opacity ??
  (def && 'defaultOpacity' in def && typeof def.defaultOpacity === 'number'
    ? def.defaultOpacity
    : 1);

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
    })
  | IsWmsLayerDef
  | IsMapLibreLayerDef
  | IsParametricShadingLayerDef
  | IsGalleryLayerDef
  | IsInteractiveLayerDef
  | IsWikipediaLayerDef
  | IsRadarLayerDef;

export type IsCustomLayer = {
  name?: string;
};

export type IsCustomLayerTechnologiesDef =
  | IsTileLayerDef
  | IsWmsLayerDef
  | IsMapLibreLayerDef
  | IsParametricShadingLayerDef;

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

export const IsParametricShadingLayerDefSchema = z.object({
  technology: z.literal('parametricShading'),
  url: z.string(),
  maxNativeZoom: z.number().optional(),
  zIndex: z.number().optional(),
  scaleWithDpi: z.boolean().optional(),
});

export const IsCustomLayerTechnologiesDefSchema = z.discriminatedUnion(
  'technology',
  [
    IsTileLayerDefSchema,
    IsWmsLayerDefSchema,
    IsMapLibreLayerDefSchema,
    IsParametricShadingLayerDefSchema,
  ],
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

export const CustomLayerDefArrayCompatSchema = z
  .array(z.unknown())
  .transform((defs) =>
    defs.flatMap<CustomLayerDef>((def) => {
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

export const integratedLayerDefs: IntegratedLayerDef[] = [
  {
    layer: 'base',
    type: 'X',
    defaultInMenu: true,
    defaultInToolbar: true,
    // bbox of freemap-outdoor-map/limit-europe-buffered.geojson (the renderer's
    // coverage polygon), rounded — the "zoom to coverage" target
    bbox: [-33.22, 28.97, 47.16, 81.17],
    technology: 'tile',
    icon: <GiTreasureMap />,
    url: `${process.env['FM_MAPSERVER_URL']}/{z}/{x}/{y}`,
    extraScales: [2, 3, 4],
    attribution: OUTDOOR_ATTRIBUTION,
    minZoom: 5,
    maxNativeZoom: 20,
    shortcut: { code: 'KeyX' },
    premiumFromZoom: 19,
    creditsPerMTile: 5000,
    countries: [
      'ad',
      'al',
      'at',
      'ba',
      'be',
      'bg',
      'by',
      'ch',
      'cs',
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
      'uk',
      'va',
      'xk',
    ],
  },
  {
    layer: 'base',
    type: 'XK',
    technology: 'tile',
    icon: <FaHiking />,
    url: `${process.env['FM_MAPSERVER_URL']}/kst/{z}/{x}/{y}`,
    extraScales: [2, 3, 4],
    attribution: OUTDOOR_ATTRIBUTION,
    minZoom: 5,
    maxNativeZoom: 20,
    countries: ['sk'],
  },
  {
    layer: 'base',
    type: 'O',
    defaultInToolbar: true,
    defaultInMenu: true,
    technology: 'tile',
    icon: <SiOpenstreetmap />,
    url: '//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    minZoom: 0,
    maxNativeZoom: 19,
    attribution: [OSM_MAP_ATTR, OSM_DATA_ATTR],
    shortcut: { code: 'KeyO' },
  },
  {
    layer: 'base',
    type: 'Z',
    defaultInToolbar: true,
    defaultInMenu: true,
    technology: 'tile',
    url: 'https://ortofoto.tiles.freemap.sk/{z}/{x}/{y}.jpg',
    minZoom: 0,
    maxNativeZoom: 20,
    scaleWithDpi: true,
    icon: <FaPlane />,
    attribution: [
      {
        type: 'map',
        name: '©\xa0GKÚ, NLC',
        url: OFM_URL,
        country: 'sk',
      },
      CUZK_ATTR,
    ],
    shortcut: { code: 'KeyZ' },
    errorTileUrl: white1x1,
    premiumFromZoom: 20,
    creditsPerMTile: 1000,
    countries: ['sk', 'cz'],
  },
  {
    layer: 'base',
    type: 'S',
    defaultInToolbar: true,
    defaultInMenu: true,
    technology: 'tile',
    url: 'https://{s}.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    subdomains: ['server', 'services'],
    icon: <FaPlane />,
    minZoom: 0,
    maxNativeZoom: 19,
    scaleWithDpi: true,
    shortcut: { code: 'KeyS' },
    attribution: [
      {
        type: 'map',
        name: '©\xa0Esri', // TODO others, see https://github.com/esri/esri-leaflet#terms
        url: 'https://www.esri.com/',
      },
    ],
  },
  {
    layer: 'base',
    type: 'J1',
    technology: 'tile',
    url: 'https://ofmozaika1c.tiles.freemap.sk/{z}/{x}/{y}.jpg',
    minZoom: 0,
    maxNativeZoom: 19,
    scaleWithDpi: true,
    icon: <FaPlane />,
    attribution: [
      {
        type: 'map',
        name: '©\xa0GKÚ, NLC',
        url: OFM_URL,
      },
    ],
    errorTileUrl: white1x1,
    creditsPerMTile: 1000,
    countries: ['sk'],
    superseededBy: 'Z',
  },
  {
    layer: 'base',
    type: 'J2',
    technology: 'tile',
    url: 'https://ofmozaika2c.tiles.freemap.sk/{z}/{x}/{y}.jpg',
    minZoom: 0,
    maxNativeZoom: 19,
    scaleWithDpi: true,
    icon: <FaPlane />,
    attribution: [
      {
        type: 'map',
        name: '©\xa0GKÚ, NLC',
        url: OFM_URL,
      },
    ],
    errorTileUrl: white1x1,
    creditsPerMTile: 1000,
    countries: ['sk'],
    superseededBy: 'Z',
  },
  {
    layer: 'base',
    type: 'd',
    defaultInMenu: true,
    technology: 'tile',
    url: '//tile.memomaps.de/tilegen/{z}/{x}/{y}.png',
    minZoom: 0,
    maxNativeZoom: 18,
    icon: <FaBus />,
    cors: false,
    attribution: [
      {
        type: 'map',
        name: '©\xa0MeMoMaps',
        url: 'https://memomaps.de/en/',
      },
      OSM_DATA_ATTR,
    ],
    shortcut: { code: 'KeyQ' },
  },
  {
    layer: 'base',
    type: '7',
    technology: 'tile',
    url: 'https://sk-hires-shading.tiles.freemap.sk/{z}/{x}/{y}.jpg',
    minZoom: 0,
    maxNativeZoom: 20,
    icon: <GiHills />,
    attribution: [
      FM_ATTR,
      {
        type: 'data',
        name: 'LLS DMR: ©\xa0ÚGKK SR',
        url: LLS_URL,
      },
    ],
    shortcut: { code: 'KeyH' },
    errorTileUrl: white1x1,
    scaleWithDpi: true,
    premiumFromZoom: 17,
    creditsPerMTile: 1000,
    countries: ['sk'],
  },
  {
    layer: 'base',
    type: '8',
    technology: 'tile',
    url: 'https://cz-hires-shading.tiles.freemap.sk/{z}/{x}/{y}.jpg',
    minZoom: 0,
    maxNativeZoom: 18,
    icon: <GiHills />,
    attribution: [FM_ATTR, CUZK_ATTR],
    errorTileUrl: white1x1,
    scaleWithDpi: true,
    premiumFromZoom: 16,
    countries: ['cz'],
  },
  {
    layer: 'base',
    type: '5',
    technology: 'tile',
    url: 'https://dmr5-shading.tiles.freemap.sk/{z}/{x}/{y}.jpg',
    minZoom: 0,
    maxNativeZoom: 18,
    icon: <GiHills />,
    attribution: [
      FM_ATTR,
      {
        type: 'data',
        name: 'DMR 5.0: ©\xa0ÚGKK SR',
        url: LLS_URL,
      },
    ],
    errorTileUrl: black1x1,
    scaleWithDpi: true,
    creditsPerMTile: 1000,
    countries: ['sk'],
  },
  {
    layer: 'base',
    type: '6',
    technology: 'tile',
    url: 'https://dmp1-shading.tiles.freemap.sk/{z}/{x}/{y}.jpg',
    minZoom: 0,
    maxNativeZoom: 18,
    icon: <GiHills />,
    attribution: [
      FM_ATTR,
      {
        type: 'data',
        name: 'DMP 1.0: ©\xa0ÚGKK SR',
        url: LLS_URL,
      },
    ],
    errorTileUrl: black1x1,
    scaleWithDpi: true,
    creditsPerMTile: 1000,
    countries: ['sk'],
  },
  {
    layer: 'base',
    type: 'VO',
    technology: 'maplibre',
    url: maptiler('openstreetmap'),
    icon: <FaMap />,
    attribution: [
      OSM_DATA_ATTR,
      {
        type: 'map',
        nameKey: 'maptiler',
      },
    ],
  },
  {
    layer: 'base',
    type: 'VS',
    defaultInMenu: true,
    technology: 'maplibre',
    url: maptiler('streets-v2'),
    icon: <FaMap />,
    attribution: [
      OSM_DATA_ATTR,
      {
        type: 'map',
        nameKey: 'maptiler',
      },
    ],
  },
  {
    layer: 'base',
    type: 'VD',
    technology: 'maplibre',
    url: maptiler('dataviz-dark'),
    icon: <FaMap />,
    attribution: [
      OSM_DATA_ATTR,
      {
        type: 'map',
        nameKey: 'maptiler',
      },
    ],
  },
  {
    layer: 'base',
    type: 'VT',
    defaultInMenu: true,
    technology: 'maplibre',
    url: maptiler('outdoor-v2'),
    icon: <FaMap />,
    attribution: [
      OSM_DATA_ATTR,
      {
        type: 'map',
        nameKey: 'maptiler',
      },
    ],
  },
  {
    layer: 'base',
    type: 'WKA',
    technology: 'wms',
    url: 'https://kataster.skgeodesy.sk/eskn/services/NR/kn_wms_norm/MapServer/WMSServer',
    layers: [
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '10',
      '11',
      '12',
      '13',
      '14',
      '15',
    ],
    icon: <LuLandPlot />,
    attribution: [GKU_ATTR],
    countries: ['sk'],
    shortcut: { code: 'KeyK' },
    premiumFromZoom: 15,
  },
  {
    layer: 'base',
    type: 'WDZ',
    technology: 'wms',
    url: 'https://gis.nlcsk.org/arcgis/services/Inspire/DrevinoveZlozenie/MapServer/WMSServer',
    layers: ['0'],
    icon: <FaTree />,
    attribution: [NLC_ATTR],
    countries: ['sk'],
    minZoom: 13,
    premiumFromZoom: 15,
  },
  {
    layer: 'base',
    type: 'WLT',
    technology: 'wms',
    url: 'https://www.nlcsk.org/mgs/services/Inspire/LesneTypy/MapServer/WMSServer',
    layers: ['LC.LandCoverSurfaces'],
    icon: <FaTree />,
    attribution: [NLC_ATTR],
    countries: ['sk'],
    minZoom: 12,
    premiumFromZoom: 15,
  },
  {
    layer: 'base',
    type: 'WGE',
    technology: 'wms',
    url: 'https://ags.geology.sk/arcgis/services/WebServices/GM50/MapServer/WMSServer',
    layers: ['0', '1', '2'],
    icon: <GiStonePile />,
    shortcut: { code: 'KeyL' },
    attribution: [GEOLOGY_ATTR],
    countries: ['sk'],
    premiumFromZoom: 15,
  },
  {
    layer: 'base',
    type: 'WHC',
    technology: 'wms',
    url: 'https://ags.geology.sk/arcgis/services/WebServices/HGCH50/MapServer/WMSServer',
    layers: ['1', '2', '3', '4'],
    icon: <FaWater />,
    shortcut: { code: 'KeyW' },
    attribution: [GEOLOGY_ATTR],
    countries: ['sk'],
    premiumFromZoom: 15,
  },
  {
    layer: 'overlay',
    type: 'i',
    technology: 'interactive',
    icon: <FaPencilAlt />,
    shortcut: { code: 'KeyD', shift: true },
    attribution: [],
  },
  {
    layer: 'overlay',
    type: 'I',
    defaultInToolbar: true,
    defaultInMenu: true,
    technology: 'gallery',
    icon: <FaCamera />,
    minZoom: 10,
    shortcut: { code: 'KeyF', shift: true },
    zIndex: 4,
    attribution: [
      {
        type: 'photos',
        nameKey: 'photosCc',
        url: 'https://creativecommons.org/',
      },
      {
        type: 'photos',
        name: 'Wikimedia Commons',
        url: 'https://commons.wikimedia.org/',
      },
    ],
  },
  {
    layer: 'overlay',
    type: 'w',
    defaultInMenu: true,
    defaultInToolbar: true,
    technology: 'wikipedia',
    icon: <FaWikipediaW />,
    minZoom: 8,
    shortcut: { code: 'KeyW', shift: true },
    zIndex: 4,
    attribution: [],
  },
  {
    layer: 'overlay',
    type: 'R',
    defaultInMenu: true,
    technology: 'radar',
    icon: <FaCloudShowersHeavy />,
    shortcut: { code: 'KeyR', shift: true },
    // The measured feed's ceiling. Each feed's real band comes from its own
    // status document — the forecast is served over a narrower one — so this is
    // only what the registry advertises (offline export, the layer table).
    maxNativeZoom: 9,
    zIndex: 3,
    // Precipitation is read against the map it falls on, so it starts
    // translucent rather than hiding the ground.
    defaultOpacity: 2 / 3,
    attribution: [OPERA_ATTR, DPC_RADAR_ATTR],
  },
  {
    layer: 'overlay',
    type: 'h',
    technology: 'parametricShading',
    url: 'https://parametric-shading.tiles.freemap.sk/europe/{z}/{x}/{y}',
    icon: <GiHills />,
    shortcut: { code: 'KeyH', shift: true },
    scaleWithDpi: true,
    maxNativeZoom: 13,
    attribution: [FM_ATTR, GEDTM30_ATTR],
    experimental: true,
    zIndex: 2,
  },
  {
    layer: 'overlay',
    type: 'y',
    technology: 'parametricShading',
    url: 'https://parametric-shading.tiles.freemap.sk/sk/{z}/{x}/{y}',
    icon: <GiHills />,
    shortcut: { code: 'KeyY', shift: true },
    scaleWithDpi: true,
    maxNativeZoom: 19,
    attribution: [
      FM_ATTR,
      {
        type: 'data',
        name: 'LLS DMR: ©\xa0ÚGKK SR',
        url: LLS_URL,
      },
    ],
    experimental: true,
    premiumFromZoom: 13,
    zIndex: 2,
    countries: ['sk'],
  },
  {
    layer: 'overlay',
    type: 'z',
    technology: 'parametricShading',
    url: 'https://parametric-shading.tiles.freemap.sk/cz/{z}/{x}/{y}',
    icon: <GiHills />,
    scaleWithDpi: true,
    maxNativeZoom: 18,
    attribution: [FM_ATTR, CUZK_ATTR],
    experimental: true,
    premiumFromZoom: 13,
    zIndex: 2,
    countries: ['cz'],
  },
  {
    layer: 'overlay',
    type: 'l1',
    defaultInMenu: false,
    technology: 'tile',
    icon: <FaTractor />,
    url: 'https://nlc.tiles.freemap.sk/{z}/{x}/{y}.png',
    attribution: [NLC_ATTR],
    minZoom: 11,
    maxNativeZoom: 15,
    zIndex: 3,
    errorTileUrl: transparent1x1,
    creditsPerMTile: 1000,
    countries: ['sk'],
    superseededBy: 'l2',
  },
  {
    layer: 'overlay',
    type: 'l2',
    defaultInMenu: true,
    technology: 'maplibre',
    icon: <FaTractor />,
    url: 'https://nlc-v2.tiles.freemap.sk/styles/lesne/style.json',
    attribution: [NLC_ATTR],
    // leaflet minZoom; the source data starts at zoom 8 and maplibre-gl-leaflet
    // runs one zoom level behind (see MaplibreLayer), so it appears at leaflet 9
    minZoom: 9,
    shortcut: { code: 'KeyN', shift: true },
    countries: ['sk'],
  },
  // {
  //   layer: 'overlay',
  //   type: 'm',
  //   technology: 'wms',
  //   icon: <FaTractor />,
  //   url: 'https://www.nlcsk.org/mgs/services/Inspire/LesneCesty/MapServer/WMSServer',
  //   layers: ['1', '2', '4', '5', '6'],
  //   attribution: [NLC_ATTR],
  //   shortcut: { code: 'KeyM', shift: true },
  //   zIndex: 4,
  //   countries: ['sk'],
  // },
  {
    layer: 'overlay',
    type: 'wka',
    technology: 'wms',
    url: 'https://kataster.skgeodesy.sk/eskn/services/NR/kn_wms_orto/MapServer/WMSServer',
    layers: [
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '10',
      '11',
      '12',
      '13',
      '14',
      '15',
    ],
    icon: <LuLandPlot />,
    attribution: [GKU_ATTR],
    countries: ['sk'],
    shortcut: { code: 'KeyK', shift: true },
    zIndex: 3,
    premiumFromZoom: 15,
  },
];

function maptiler(style: string) {
  return `https://api.maptiler.com/maps/${style}/style.json?key=KgKDGG75zYDIyCCTAG6L`;
}

export const integratedLayerDefMap = Object.fromEntries(
  integratedLayerDefs.map((def) => [def.type, def]),
);
