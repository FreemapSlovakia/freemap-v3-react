import {
  type IntegratedLayerDef,
  LAYER_ALIASES,
  type LayerTechnology,
  type MapBody,
  type MapIndexEntry,
  OUTDOOR_BBOX,
  OUTDOOR_COUNTRIES,
} from '@shared/mapDefinitions.js';
import {
  FaBicycle,
  FaBinoculars,
  FaBus,
  FaCamera,
  FaCloudShowersHeavy,
  FaHiking,
  FaHorse,
  FaMap,
  FaPencilAlt,
  FaPlane,
  FaSkiing,
  FaTractor,
  FaTree,
  FaWater,
  FaWikipediaW,
} from 'react-icons/fa';
import {
  GiHills,
  GiMountainRoad,
  GiPeaks,
  GiStonePath,
  GiStonePile,
  GiTreasureMap,
} from 'react-icons/gi';
import { IoAirplaneOutline } from 'react-icons/io5';
import { LuLandPlot } from 'react-icons/lu';
import { SiOpenstreetmap } from 'react-icons/si';
import aerialBody from './defs/aerial.js';
import dataLayerBody from './defs/dataLayer.js';
import openStreetMapBody from './defs/openStreetMap.js';
import outdoorBody from './defs/outdoor.js';
import parametricShadingBody from './defs/parametricShading.js';
import photosBody from './defs/photos.js';
import viewshedBody from './defs/viewshed.js';
import weatherRadarBody from './defs/weatherRadar.js';
import wikipediaBody from './defs/wikipedia.js';

type EntrySpec<T extends LayerTechnology> = Omit<
  MapIndexEntry<T>,
  'load' | 'bundled'
> &
  ({ load: () => Promise<MapBody<T>> } | { bundled: MapBody<T> });

/** Ties an entry's body to its technology; a bundled body loads at once. */
function entry<T extends LayerTechnology>(
  spec: EntrySpec<T>,
): MapIndexEntry<T> {
  if (!('bundled' in spec)) {
    return spec;
  }

  const body = spec.bundled;

  return { ...spec, load: () => Promise.resolve(body) };
}

/**
 * Every library map, in the order the menus list them. A map's body is in its
 * own file under `defs/`, named for readability: ids differ only by case. The
 * common maps and the feature layers are bundled; the rest load when wanted.
 */
export const mapIndex: MapIndexEntry[] = [
  entry({
    layer: 'base',
    type: 'X',
    technology: 'tile',
    defaultInMenu: true,
    defaultInToolbar: true,
    bbox: OUTDOOR_BBOX,
    icon: <GiTreasureMap />,
    shortcut: { code: 'KeyX' },
    countries: OUTDOOR_COUNTRIES,
    bundled: outdoorBody,
  }),
  entry({
    layer: 'base',
    type: 'XK',
    technology: 'tile',
    icon: <FaHiking />,
    countries: ['sk'],
    load: () => import('./defs/outdoorKst.js').then((m) => m.default),
  }),
  entry({
    layer: 'base',
    type: 'O',
    technology: 'tile',
    defaultInToolbar: true,
    defaultInMenu: true,
    icon: <SiOpenstreetmap />,
    shortcut: { code: 'KeyO' },
    bundled: openStreetMapBody,
  }),
  entry({
    layer: 'base',
    type: 'S',
    technology: 'tile',
    defaultInToolbar: true,
    defaultInMenu: true,
    icon: <FaPlane />,
    shortcut: { code: 'KeyS' },
    bundled: aerialBody,
  }),
  entry({
    layer: 'base',
    type: 'J1',
    technology: 'tile',
    icon: <FaPlane />,
    countries: ['sk'],
    superseededBy: 'S',
    load: () => import('./defs/aerial2017.js').then((m) => m.default),
  }),
  entry({
    layer: 'base',
    type: 'J2',
    technology: 'tile',
    icon: <FaPlane />,
    countries: ['sk'],
    superseededBy: 'S',
    load: () => import('./defs/aerial2020.js').then((m) => m.default),
  }),
  entry({
    layer: 'base',
    type: 'd',
    technology: 'tile',
    defaultInMenu: true,
    icon: <FaBus />,
    shortcut: { code: 'KeyQ' },
    load: () => import('./defs/publicTransport.js').then((m) => m.default),
  }),
  entry({
    layer: 'base',
    type: '7',
    technology: 'tile',
    icon: <GiHills />,
    shortcut: { code: 'KeyH' },
    countries: ['sk'],
    load: () => import('./defs/detailedShading.js').then((m) => m.default),
  }),
  entry({
    layer: 'base',
    type: '6',
    technology: 'tile',
    icon: <GiHills />,
    countries: ['sk'],
    load: () => import('./defs/surfaceShading.js').then((m) => m.default),
  }),
  entry({
    layer: 'base',
    type: 'VO',
    technology: 'maplibre',
    icon: <FaMap />,
    load: () => import('./defs/maptilerOsm.js').then((m) => m.default),
  }),
  entry({
    layer: 'base',
    type: 'VS',
    technology: 'maplibre',
    defaultInMenu: true,
    icon: <FaMap />,
    load: () => import('./defs/maptilerStreets.js').then((m) => m.default),
  }),
  entry({
    layer: 'base',
    type: 'VD',
    technology: 'maplibre',
    icon: <FaMap />,
    load: () => import('./defs/maptilerDataviz.js').then((m) => m.default),
  }),
  entry({
    layer: 'base',
    type: 'VT',
    technology: 'maplibre',
    defaultInMenu: true,
    icon: <FaMap />,
    load: () => import('./defs/maptilerOutdoor.js').then((m) => m.default),
  }),
  entry({
    layer: 'base',
    type: 'WKA',
    technology: 'wms',
    icon: <LuLandPlot />,
    countries: ['sk'],
    shortcut: { code: 'KeyK' },
    load: () => import('./defs/cadastre.js').then((m) => m.default),
  }),
  entry({
    layer: 'base',
    type: 'WDZ',
    technology: 'wms',
    icon: <FaTree />,
    countries: ['sk'],
    load: () => import('./defs/treeComposition.js').then((m) => m.default),
  }),
  entry({
    layer: 'base',
    type: 'WLT',
    technology: 'wms',
    icon: <FaTree />,
    countries: ['sk'],
    load: () => import('./defs/forestTypes.js').then((m) => m.default),
  }),
  entry({
    layer: 'base',
    type: 'WGE',
    technology: 'wms',
    icon: <GiStonePile />,
    shortcut: { code: 'KeyL' },
    countries: ['sk'],
    load: () => import('./defs/geology.js').then((m) => m.default),
  }),
  entry({
    layer: 'base',
    type: 'WHC',
    technology: 'wms',
    icon: <FaWater />,
    shortcut: { code: 'KeyW' },
    countries: ['sk'],
    load: () => import('./defs/hydrochemistry.js').then((m) => m.default),
  }),
  entry({
    layer: 'overlay',
    type: 'i',
    technology: 'interactive',
    icon: <FaPencilAlt />,
    shortcut: { code: 'KeyD', shift: true },
    bundled: dataLayerBody,
  }),
  entry({
    layer: 'overlay',
    type: 'I',
    technology: 'gallery',
    defaultInToolbar: true,
    defaultInMenu: true,
    icon: <FaCamera />,
    shortcut: { code: 'KeyF', shift: true },
    bundled: photosBody,
  }),
  entry({
    layer: 'overlay',
    type: 'w',
    technology: 'wikipedia',
    defaultInMenu: true,
    defaultInToolbar: true,
    icon: <FaWikipediaW />,
    shortcut: { code: 'KeyW', shift: true },
    bundled: wikipediaBody,
  }),
  entry({
    layer: 'overlay',
    type: 'R',
    technology: 'radar',
    defaultInMenu: true,
    icon: <FaCloudShowersHeavy />,
    shortcut: { code: 'KeyR', shift: true },
    bundled: weatherRadarBody,
  }),
  entry({
    layer: 'overlay',
    type: 'v',
    technology: 'viewshed',
    defaultInMenu: true,
    icon: <FaBinoculars />,
    shortcut: { code: 'KeyV', shift: true },
    bundled: viewshedBody,
  }),
  // The renderer's overlays: stacked aerial map, hiking, the other routes,
  // then the grades on paths.
  entry({
    layer: 'overlay',
    type: 'xs',
    technology: 'tile',
    defaultInMenu: true,
    bbox: OUTDOOR_BBOX,
    icon: <GiPeaks />,
    countries: OUTDOOR_COUNTRIES,
    load: () => import('./defs/hikingDifficulty.js').then((m) => m.default),
  }),
  entry({
    layer: 'overlay',
    type: 'xq',
    technology: 'tile',
    defaultInMenu: true,
    bbox: OUTDOOR_BBOX,
    icon: <GiStonePath />,
    countries: OUTDOOR_COUNTRIES,
    load: () => import('./defs/roadSmoothness.js').then((m) => m.default),
  }),
  entry({
    layer: 'overlay',
    type: 'xm',
    technology: 'tile',
    defaultInMenu: true,
    bbox: OUTDOOR_BBOX,
    icon: <GiMountainRoad />,
    countries: OUTDOOR_COUNTRIES,
    load: () => import('./defs/mtbDifficulty.js').then((m) => m.default),
  }),
  entry({
    layer: 'overlay',
    type: 'xh',
    technology: 'tile',
    defaultInMenu: true,
    bbox: OUTDOOR_BBOX,
    icon: <FaHiking />,
    countries: OUTDOOR_COUNTRIES,
    load: () => import('./defs/hikingTrails.js').then((m) => m.default),
  }),
  entry({
    layer: 'overlay',
    type: 'xb',
    technology: 'tile',
    defaultInMenu: true,
    bbox: OUTDOOR_BBOX,
    icon: <FaBicycle />,
    countries: OUTDOOR_COUNTRIES,
    load: () => import('./defs/bicycleTrails.js').then((m) => m.default),
  }),
  entry({
    layer: 'overlay',
    type: 'xl',
    technology: 'tile',
    defaultInMenu: true,
    bbox: OUTDOOR_BBOX,
    icon: <FaSkiing />,
    countries: OUTDOOR_COUNTRIES,
    load: () => import('./defs/skiTrails.js').then((m) => m.default),
  }),
  entry({
    layer: 'overlay',
    type: 'xr',
    technology: 'tile',
    defaultInMenu: true,
    bbox: OUTDOOR_BBOX,
    icon: <FaHorse />,
    countries: OUTDOOR_COUNTRIES,
    load: () => import('./defs/horseTrails.js').then((m) => m.default),
  }),
  entry({
    layer: 'overlay',
    type: 'xa',
    technology: 'tile',
    defaultInMenu: true,
    bbox: OUTDOOR_BBOX,
    icon: <IoAirplaneOutline />,
    countries: OUTDOOR_COUNTRIES,
    load: () => import('./defs/outdoorOverlay.js').then((m) => m.default),
  }),
  entry({
    layer: 'overlay',
    type: 'h',
    technology: 'parametricShading',
    defaultInMenu: true,
    icon: <GiHills />,
    shortcut: { code: 'KeyH', shift: true },
    bundled: parametricShadingBody,
  }),
  entry({
    layer: 'overlay',
    type: 'l1',
    technology: 'tile',
    defaultInMenu: false,
    icon: <FaTractor />,
    countries: ['sk'],
    superseededBy: 'l2',
    load: () => import('./defs/forestTracks2017.js').then((m) => m.default),
  }),
  entry({
    layer: 'overlay',
    type: 'l2',
    technology: 'maplibre',
    defaultInMenu: true,
    icon: <FaTractor />,
    shortcut: { code: 'KeyN', shift: true },
    countries: ['sk'],
    load: () => import('./defs/forestTracks.js').then((m) => m.default),
  }),
  entry({
    layer: 'overlay',
    type: 'wka',
    technology: 'wms',
    icon: <LuLandPlot />,
    countries: ['sk'],
    shortcut: { code: 'KeyK', shift: true },
    load: () => import('./defs/cadastreOverlay.js').then((m) => m.default),
  }),
];

export const mapIndexById: Readonly<Record<string, MapIndexEntry>> =
  Object.fromEntries(mapIndex.map((e) => [e.type, e]));

/** Every id a stored layer list may name: the library's and the aliases. */
export const knownLayerIds = (): string[] => [
  ...Object.keys(mapIndexById),
  ...Object.keys(LAYER_ALIASES),
];

/** The bodies of the bundled maps, by id. */
export const bundledBodies: Readonly<Record<string, MapBody>> =
  Object.fromEntries(
    mapIndex.flatMap((e) => (e.bundled ? [[e.type, e.bundled]] : [])),
  );

/** A library map whole, loading its body if need be; undefined for an unknown id. */
export async function loadIntegratedLayerDef(
  type: string,
): Promise<IntegratedLayerDef | undefined> {
  const entry = mapIndexById[type];

  if (!entry) {
    return undefined;
  }

  return withBody(entry, await entry.load());
}

/** An index entry with its body: the map as the rest of the app knows it. */
export function withBody(
  { load: _, bundled: __, ...entry }: MapIndexEntry,
  body: MapBody,
): IntegratedLayerDef {
  return { ...entry, ...body } as IntegratedLayerDef;
}
