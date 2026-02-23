import * as auth from '../features/auth/model/actions.js';
import * as changesets from '../features/changesets/model/actions.js';
import * as drawing from '../features/drawing/model/actions/drawingLineActions.js';
import * as drawingPoints from '../features/drawing/model/actions/drawingPointActions.js';
import * as elevationChart from './elevationChartActions.js';
import * as gallery from '../features/gallery/model/actions.js';
import * as l10n from './l10nActions.js';
import * as main from './mainActions.js';
import * as map from '../features/map/model/actions.js';
import * as mapDetails from '../features/mapDetails/model/actions.js';
import * as maps from '../features/myMaps/model/actions.js';
import * as objects from '../features/objects/model/actions.js';
import * as osm from './osmActions.js';
import * as routePlanner from '../features/routePlanner/model/actions.js';
import * as rpc from './rpcActions.js';
import * as search from '../features/search/model/actions.js';
import * as toasts from '../features/toasts/model/actions.js';
import { trackingActions } from '../features/tracking/model/actions.js';
import * as trackViewer from '../features/trackViewer/model/actions.js';
import * as ws from './websocketActions.js';
import * as wiki from '../features/wiki/model/actions.js';

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
