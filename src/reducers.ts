import storage from 'local-storage-fallback';
import { is } from 'typia';
import type { GalleryColorizeBy } from './features/gallery/model/actions.js';
import { MapDetailsSource } from './features/mapDetails/model/actions.js';
import { upgradeCustomLayerDefs } from './mapDefinitions.js';
import {
  authInitialState,
  authReducer,
  type AuthState,
} from './features/auth/model/reducer.js';
import { changesetReducer } from './features/changesets/model/reducer.js';
import { drawingLinesReducer } from './features/drawing/model/reducers/drawingLinesReducer.js';
import { drawingPointsReducer } from './features/drawing/model/reducers/drawingPointsReducer.js';
import { elevationChartReducer } from './features/elevationChart/model/reducer.js';
import {
  galleryInitialState,
  galleryReducer,
} from './features/gallery/model/reducer.js';
import {
  l10nInitialState,
  l10nReducer,
  type L10nState,
} from './reducers/l10nReducer.js';
import {
  mainInitialState,
  mainReducer,
  type MainState,
} from './reducers/mainReducer.js';
import {
  mapDetailsInitialState,
  mapDetailsReducer,
} from './features/mapDetails/model/reducer.js';
import {
  mapInitialState,
  mapReducer,
  type MapState,
} from './features/map/model/reducer.js';
import { mapsReducer } from './features/myMaps/model/reducer.js';
import {
  objectInitialState,
  objectsReducer,
  type ObjectsState,
} from './features/objects/model/reducer.js';
import {
  routePlannerInitialState,
  routePlannerReducer,
  type RoutePlannerState,
} from './features/routePlanner/model/reducer.js';
import { searchReducer } from './features/search/model/reducer.js';
import { toastsReducer } from './features/toasts/model/reducer.js';
import { trackingReducer } from './features/tracking/model/reducer.js';
import {
  trackViewerInitialState,
  trackViewerReducer,
  type TrackViewerState,
} from './features/trackViewer/model/reducer.js';
import { websocketReducer } from './reducers/websocketReducer.js';
import { wikiReducer } from './features/wiki/model/reducer.js';
import type { RootState } from './store.js';
import {
  migrateTransportType,
  transportTypeDefs,
} from './transportTypeDefs.js';
import { StringDates } from './types/common.js';

export const reducers = {
  auth: authReducer,
  changesets: changesetReducer,
  drawingLines: drawingLinesReducer,
  drawingPoints: drawingPointsReducer,
  elevationChart: elevationChartReducer,
  gallery: galleryReducer,
  l10n: l10nReducer,
  main: mainReducer,
  mapDetails: mapDetailsReducer,
  map: mapReducer,
  objects: objectsReducer,
  routePlanner: routePlannerReducer,
  search: searchReducer,
  toasts: toastsReducer,
  tracking: trackingReducer,
  trackViewer: trackViewerReducer,
  websocket: websocketReducer,
  maps: mapsReducer,
  wiki: wikiReducer,
};

export function getInitialState() {
  let persisted: Partial<Record<keyof RootState, unknown>>;

  try {
    persisted = JSON.parse(storage.getItem('store') ?? '{}');
  } catch {
    persisted = {};
  }

  const initial: Partial<RootState> = {};

  if (is<{ mapType: string; overlays: string[] }>(persisted.map)) {
    (persisted.map as unknown as { layers: string[] }).layers = [
      persisted.map.mapType,
      ...persisted.map.overlays,
    ];
  }

  if (!is<{ customLayers: unknown }>(persisted.map)) {
    // nothing
  } else if (is<{ customLayers: unknown[] }>(persisted.map)) {
    persisted.map.customLayers = upgradeCustomLayerDefs(
      persisted.map.customLayers,
    );
  } else {
    delete persisted.map.customLayers;
  }

  if (is<Partial<MapState>>(persisted.map)) {
    initial.map = { ...mapInitialState, ...persisted.map };
  }

  if (is<Partial<L10nState>>(persisted.l10n)) {
    initial.l10n = { ...l10nInitialState, ...persisted.l10n };
  }

  if (is<Partial<StringDates<Omit<AuthState, 'purchases'>>>>(persisted.auth)) {
    initial.auth = {
      ...authInitialState,
      ...persisted.auth,
      user:
        persisted.auth.user === undefined
          ? authInitialState.user
          : persisted.auth.user && {
              ...persisted.auth.user,
              premiumExpiration: persisted.auth.user.premiumExpiration
                ? new Date(persisted.auth.user.premiumExpiration)
                : null,
            },
    };
  }

  if (is<Partial<MainState>>(persisted.main)) {
    initial.main = { ...mainInitialState, ...persisted.main };
  }

  if (is<Partial<ObjectsState>>(persisted.objects)) {
    initial.objects = { ...objectInitialState, ...persisted.objects };
  }

  if (is<{ transportType: unknown }>(persisted.routePlanner)) {
    persisted.routePlanner.transportType = migrateTransportType(
      persisted.routePlanner.transportType,
    );
  }

  if (is<Partial<RoutePlannerState>>(persisted.routePlanner)) {
    initial.routePlanner = {
      ...routePlannerInitialState,
      ...persisted.routePlanner,
    };
  }

  if (is<Partial<TrackViewerState>>(persisted.trackViewer)) {
    initial.trackViewer = {
      ...trackViewerInitialState,
      ...persisted.trackViewer,
    };
  }

  if (is<{ sources: MapDetailsSource[] }>(persisted.mapDetails)) {
    initial.mapDetails = {
      ...mapDetailsInitialState,
      ...persisted.mapDetails,
    };
  }

  if (
    is<{
      colorizeBy?: GalleryColorizeBy | null;
      recentTags?: string[];
      showDirection?: boolean;
      showLegend?: boolean;
      premium?: boolean;
    }>(persisted.gallery)
  ) {
    initial.gallery = {
      ...galleryInitialState,
      ...persisted.gallery,
    };
  }

  const tt = initial.routePlanner?.transportType;

  if (initial.routePlanner && tt && !transportTypeDefs[tt]) {
    initial.routePlanner.transportType = 'hiking';
  }

  return initial;
}
