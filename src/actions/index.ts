import * as auth from './authActions.js';
import * as changesets from './changesetsActions.js';
import * as drawing from './drawingLineActions.js';
import * as drawingPoints from './drawingPointActions.js';
import * as elevationChart from './elevationChartActions.js';
import * as gallery from './galleryActions.js';
import * as l10n from './l10nActions.js';
import * as main from './mainActions.js';
import * as map from './mapActions.js';
import * as mapDetails from './mapDetailsActions.js';
import * as maps from './mapsActions.js';
import * as objects from './objectsActions.js';
import * as osm from './osmActions.js';
import * as routePlanner from './routePlannerActions.js';
import * as rpc from './rpcActions.js';
import * as search from './searchActions.js';
import * as toasts from './toastsActions.js';
import { trackingActions } from './trackingActions.js';
import * as trackViewer from './trackViewerActions.js';
import * as ws from './websocketActions.js';
import * as wiki from './wikiActions.js';

export const actions = {
  tracking: trackingActions,
  main,
  ws,
  rpc,
  distanceMeasuremnet: drawing,
  auth,
  drawingPoints,
  changesets,
  elevationChart,
  gallery,
  l10n,
  map,
  mapDetails,
  objects,
  osm,
  routePlanner,
  search,
  toasts,
  trackViewer,
  maps,
  wiki,
} as const;

type ActionGroups = typeof actions;

type ExtractActionCreators<T> =
  T extends Record<string, (...args: any[]) => any> ? T[keyof T] : never;

type AllActionCreators = ExtractActionCreators<
  ActionGroups[keyof ActionGroups]
>;

// TODO we should not need such type
export type RootAction = ReturnType<AllActionCreators>;
