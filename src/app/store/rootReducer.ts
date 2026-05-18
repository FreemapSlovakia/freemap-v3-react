import { authInitialState, authReducer } from '@features/auth/model/reducer.js';
import { UserSchema, UserSettingsSchema } from '@features/auth/model/types.js';
import { cachedMapsReducer } from '@features/cachedMaps/model/reducer.js';
import { changesetReducer } from '@features/changesets/model/reducer.js';
import {
  cookieConsentInitialState,
  cookieConsentReducer,
} from '@features/cookieConsent/model/reducer.js';
import { drawingLinesReducer } from '@features/drawing/model/reducers/drawingLinesReducer.js';
import { drawingPointsReducer } from '@features/drawing/model/reducers/drawingPointsReducer.js';
import {
  drawingSettingsInitialState,
  drawingSettingsReducer,
} from '@features/drawing/model/reducers/drawingSettingsReducer.js';
import { elevationChartReducer } from '@features/elevationChart/model/reducer.js';
import {
  galleryInitialState,
  galleryReducer,
} from '@features/gallery/model/reducer.js';
import { geoIpReducer } from '@features/geoip/model/reducer.js';
import {
  homeLocationInitialState,
  homeLocationReducer,
} from '@features/homeLocation/model/reducer.js';
import { l10nInitialState, l10nReducer } from '@features/l10n/model/reducer.js';
import {
  locationInitialState,
  locationReducer,
} from '@features/location/model/reducer.js';
import { mapInitialState, mapReducer } from '@features/map/model/reducer.js';
import {
  mapDetailsInitialState,
  mapDetailsReducer,
} from '@features/mapDetails/model/reducer.js';
import { mapsReducer } from '@features/myMaps/model/reducer.js';
import {
  objectInitialState,
  objectsReducer,
} from '@features/objects/model/reducer.js';
import { progressReducer } from '@features/progress/model/reducer.js';
import {
  routePlannerInitialState,
  routePlannerReducer,
} from '@features/routePlanner/model/reducer.js';
import { searchReducer } from '@features/search/model/reducer.js';
import { toastsReducer } from '@features/toasts/model/reducer.js';
import { trackingReducer } from '@features/tracking/model/reducer.js';
import {
  trackViewerInitialState,
  trackViewerReducer,
} from '@features/trackViewer/model/reducer.js';
import { websocketReducer } from '@features/websocket/model/reducer.js';
import { wikiReducer } from '@features/wiki/model/reducer.js';
import { wikimediaCommonsReducer } from '@features/wikimediaCommons/model/reducer.js';
import { CustomLayerDefArrayCompatSchema } from '@shared/mapDefinitions.js';
import {
  TransportTypeCompatSchema,
  transportTypeDefs,
} from '@shared/transportTypeDefs.js';
import storage from 'local-storage-fallback';
import z from 'zod';
import type { RootState } from '../store/store.js';
import { mainInitialState, mainReducer } from './reducer.js';

const PersistedAuthSchema = z.object({
  user: z
    .object({
      ...UserSchema.shape,
      settings: UserSettingsSchema.optional().catch(undefined),
    })
    .nullable()
    .optional(),
});

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

export const reducers = {
  auth: authReducer,
  cachedMaps: cachedMapsReducer,
  changesets: changesetReducer,
  cookieConsent: cookieConsentReducer,
  drawingSettings: drawingSettingsReducer,
  drawingLines: drawingLinesReducer,
  drawingPoints: drawingPointsReducer,
  elevationChart: elevationChartReducer,
  geoip: geoIpReducer,
  gallery: galleryReducer,
  homeLocation: homeLocationReducer,
  l10n: l10nReducer,
  location: locationReducer,
  main: mainReducer,
  mapDetails: mapDetailsReducer,
  map: mapReducer,
  objects: objectsReducer,
  progress: progressReducer,
  routePlanner: routePlannerReducer,
  search: searchReducer,
  toasts: toastsReducer,
  tracking: trackingReducer,
  trackViewer: trackViewerReducer,
  websocket: websocketReducer,
  maps: mapsReducer,
  wiki: wikiReducer,
  wikimediaCommons: wikimediaCommonsReducer,
};

export function getInitialState() {
  let persisted: Partial<Record<keyof RootState, unknown>>;

  try {
    persisted = JSON.parse(storage.getItem('store') ?? '{}');
  } catch {
    persisted = {};
  }

  const initial: Partial<RootState> = {};

  {
    const m = z
      .object({ mapType: z.string(), overlays: z.string().array() })
      .safeParse(persisted.map);

    if (m.success) {
      (persisted.map as unknown as { layers: string[] }).layers = [
        m.data.mapType,
        ...m.data.overlays,
      ];
    }
  }

  if (isObject(persisted.map) && 'customLayers' in persisted.map) {
    const parsed = CustomLayerDefArrayCompatSchema.safeParse(
      persisted.map['customLayers'],
    );

    if (parsed.success) {
      persisted.map['customLayers'] = parsed.data;
    } else {
      delete persisted.map['customLayers'];
    }
  }

  if (isObject(persisted.map)) {
    initial.map = { ...mapInitialState, ...persisted.map };
  }

  if (isObject(persisted.l10n)) {
    initial.l10n = { ...l10nInitialState, ...persisted.l10n };
  }

  const persistedAuth = PersistedAuthSchema.safeParse(persisted.auth);

  if (persistedAuth.success) {
    const u = persistedAuth.data.user;

    initial.auth = {
      ...authInitialState,
      user: u === undefined ? authInitialState.user : u,
    };
  }

  if (isObject(persisted.cookieConsent)) {
    initial.cookieConsent = {
      ...cookieConsentInitialState,
      ...persisted.cookieConsent,
    };
  } else if (isObject(persisted.main)) {
    initial.cookieConsent = {
      ...cookieConsentInitialState,
      ...persisted.main,
    };
  }

  if (isObject(persisted.drawingSettings)) {
    initial.drawingSettings = {
      ...drawingSettingsInitialState,
      ...persisted.drawingSettings,
    };
  } else if (isObject(persisted.main)) {
    initial.drawingSettings = {
      ...drawingSettingsInitialState,
      ...persisted.main,
    };
  }

  if (isObject(persisted.homeLocation)) {
    initial.homeLocation = {
      ...homeLocationInitialState,
      ...persisted.homeLocation,
    };
  } else if (isObject(persisted.main)) {
    initial.homeLocation = {
      ...homeLocationInitialState,
      ...persisted.main,
    };
  }

  if (isObject(persisted.location)) {
    initial.location = {
      ...locationInitialState,
      ...persisted.location,
    };
  } else if (isObject(persisted.main)) {
    initial.location = {
      ...locationInitialState,
      ...persisted.main,
    };
  }

  if (isObject(persisted.main)) {
    for (const k of [
      'cookieConsentResult',
      'analyticCookiesAllowed',
      'drawingColor',
      'drawingWidth',
      'drawingRecentColors',
      'homeLocation',
      'selectingHomeLocation',
      'locate',
      'location',
      'purchaseOnLogin',
    ]) {
      delete persisted.main[k];
    }

    initial.main = { ...mainInitialState, ...persisted.main };
  }

  if (isObject(persisted.objects)) {
    initial.objects = { ...objectInitialState, ...persisted.objects };
  }

  if (isObject(persisted.routePlanner)) {
    if ('transportType' in persisted.routePlanner) {
      persisted.routePlanner['transportType'] = TransportTypeCompatSchema.parse(
        persisted.routePlanner['transportType'],
      );
    }

    initial.routePlanner = {
      ...routePlannerInitialState,
      ...persisted.routePlanner,
    };
  }

  if (isObject(persisted.trackViewer)) {
    initial.trackViewer = {
      ...trackViewerInitialState,
      ...persisted.trackViewer,
    };
  }

  if (
    isObject(persisted.mapDetails) &&
    Array.isArray(persisted.mapDetails['sources'])
  ) {
    initial.mapDetails = {
      ...mapDetailsInitialState,
      ...persisted.mapDetails,
    };
  }

  if (isObject(persisted.gallery)) {
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
