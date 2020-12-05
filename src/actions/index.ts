import { Action } from 'typesafe-actions';
import { trackingActions } from 'fm3/actions/trackingActions';
import * as main from 'fm3/actions/mainActions';
import * as ws from 'fm3/actions/websocketActions';
import * as rpc from 'fm3/actions/rpcActions';
import * as drawing from 'fm3/actions/drawingLineActions';
import * as auth from 'fm3/actions/authActions';
import * as drawingPoints from 'fm3/actions/drawingPointActions';
import * as changesets from 'fm3/actions/changesetsActions';
import * as elevationChart from 'fm3/actions/elevationChartActions';
import * as gallery from 'fm3/actions/galleryActions';
import * as l10n from 'fm3/actions/l10nActions';
import * as map from 'fm3/actions/mapActions';
import * as mapDetails from 'fm3/actions/mapDetailsActions';
import * as objects from 'fm3/actions/objectsActions';
import * as osm from 'fm3/actions/osmActions';
import * as routePlanner from 'fm3/actions/routePlannerActions';
import * as search from 'fm3/actions/searchActions';
import * as tips from 'fm3/actions/tipsActions';
import * as toasts from 'fm3/actions/toastsActions';
import * as trackViewer from 'fm3/actions/trackViewerActions';
import * as maps from 'fm3/actions/mapsActions';
import * as wiki from 'fm3/actions/wikiActions';

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
  tips,
  toasts,
  trackViewer,
  maps,
  wiki,
};

export type RootAction = Action; // TODO this makes TS superslow: ActionType<typeof actions>;
