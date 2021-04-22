import * as auth from 'fm3/actions/authActions';
import * as changesets from 'fm3/actions/changesetsActions';
import * as drawing from 'fm3/actions/drawingLineActions';
import * as drawingPoints from 'fm3/actions/drawingPointActions';
import * as elevationChart from 'fm3/actions/elevationChartActions';
import * as gallery from 'fm3/actions/galleryActions';
import * as l10n from 'fm3/actions/l10nActions';
import * as main from 'fm3/actions/mainActions';
import * as map from 'fm3/actions/mapActions';
import * as mapDetails from 'fm3/actions/mapDetailsActions';
import * as maps from 'fm3/actions/mapsActions';
import * as objects from 'fm3/actions/objectsActions';
import * as osm from 'fm3/actions/osmActions';
import * as routePlanner from 'fm3/actions/routePlannerActions';
import * as rpc from 'fm3/actions/rpcActions';
import * as search from 'fm3/actions/searchActions';
import * as tips from 'fm3/actions/tipsActions';
import * as toasts from 'fm3/actions/toastsActions';
import { trackingActions } from 'fm3/actions/trackingActions';
import * as trackViewer from 'fm3/actions/trackViewerActions';
import * as ws from 'fm3/actions/websocketActions';
import * as wiki from 'fm3/actions/wikiActions';
import { Action } from 'typesafe-actions';

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

export type RootAction = Action; // much slower but typesafe:  ActionType<typeof actions>;

declare module 'typesafe-actions' {
  interface Types {
    RootAction: RootAction;
  }
}
