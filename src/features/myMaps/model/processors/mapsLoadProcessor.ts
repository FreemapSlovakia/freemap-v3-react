import { assert, is } from 'typia';
import { authLogout, authSetUser } from '../../../auth/model/actions.js';
import type {
  Line,
  Point,
} from '../../../drawing/model/actions/drawingLineActions.js';
import { DrawingPoint } from '../../../drawing/model/actions/drawingPointActions.js';
import {
  type MapData,
  type MapMeta,
  mapsLoad,
  mapsLoaded,
} from '../actions.js';
import { httpRequest } from '../../../../httpRequest.js';
import {
  CustomLayerDef,
  upgradeCustomLayerDefs,
} from '../../../../mapDefinitions.js';
import type { Processor } from '../../../../middlewares/processorMiddleware.js';
import { migrateTransportType } from '../../../../transportTypeDefs.js';
import type { StringDates } from '../../../../types/common.js';
import { setActiveModal } from '../../../../actions/mainActions.js';

interface CompatLine {
  type: 'polygon' | 'line' | 'area' | 'distance';
  points: Point[];
  label?: string;
  color?: string;
}

interface CompatDrawingPoint {
  lat: number;
  lon: number;
  label?: string;
  color?: string;
}

export const mapsLoadProcessor: Processor = {
  actionCreator: [mapsLoad, authSetUser, authLogout],
  errorKey: 'maps.fetchError',
  handle: async ({ getState, dispatch }) => {
    const {
      auth,
      maps: { loadMeta },
    } = getState();

    if (!loadMeta || (auth.user && !auth.validated)) {
      return;
    }

    const res = await httpRequest({
      getState,
      url: `/maps/${loadMeta.id}`,
      expectedStatus: 200,
      cancelActions: [mapsLoad, authSetUser, authLogout],
    });

    const data = await res.json();

    // backward compatibility

    try {
      const features = data.data.trackViewer.trackGeojson.features;

      // typescript-is fails if feature property contains array; TODO find out why

      if (Array.isArray(features)) {
        for (const feature of features) {
          if (feature.properties) {
            for (const k in feature.properties) {
              if (typeof feature.properties[k] !== 'string') {
                delete feature.properties[k];
              }
            }
          }
        }
      }
    } catch {
      // ignore
    }

    // backward compatibility
    try {
      const { map } = data.data;

      map.layers = [map.mapType, ...map.overlays];

      delete map.mapType;
      delete map.overlays;

      if (map.customLayers) {
        map.customLayers = upgradeCustomLayerDefs(map.customLayers);

        if (!is<CustomLayerDef[]>(map.customLayers)) {
          delete map.customLayers;
        }
      }
    } catch {
      // ignore
    }

    try {
      const { routePlanner } = data.data;

      if (!routePlanner.points) {
        routePlanner.points = [
          routePlanner.start,
          ...routePlanner.midpoints,
          routePlanner.finish,
        ]
          .filter(Boolean)
          .map((pt) => ({ ...pt, manual: pt.manual ?? false }));

        routePlanner.finishOnly = !!routePlanner.finish && !routePlanner.start;

        routePlanner.transportType = migrateTransportType(
          routePlanner.transportType,
        );

        delete routePlanner.start;
        delete routePlanner.midpoints;
        delete routePlanner.finish;
      }
    } catch {
      // ignore
    }

    const map = assert<
      StringDates<{
        meta: MapMeta;
        data: MapData<Line | CompatLine, DrawingPoint | CompatDrawingPoint>;
      }>
    >(data);

    const mapData = map.data;

    if (mapData.map) {
      if (loadMeta.ignoreMap) {
        delete mapData.map.lat;

        delete mapData.map.lon;

        delete mapData.map.zoom;
      }

      if (loadMeta.ignoreLayers) {
        delete mapData.map.layers;

        delete mapData.map.shading;
      }
    }

    dispatch(
      mapsLoaded({
        merge: loadMeta.merge,
        meta: {
          ...map.meta,
          createdAt: new Date(map.meta.createdAt),
          modifiedAt: new Date(map.meta.modifiedAt),
        },
        data: {
          ...mapData,
          // get rid of OldLines
          lines: mapData.lines?.map((line) => ({
            ...line,
            type:
              line.type === 'area'
                ? 'polygon'
                : line.type === 'distance'
                  ? 'line'
                  : line.type,
          })),
          points: mapData.points?.map((point) =>
            'coords' in point
              ? point
              : {
                  color: point.color,
                  label: point.label,
                  coords: {
                    lat: point.lat,
                    lon: point.lon,
                  },
                },
          ),
          tracking: mapData.tracking && {
            ...mapData.tracking,
            trackedDevices: mapData.tracking.trackedDevices.map((device) => ({
              ...device,
              fromTime: device.fromTime ? new Date(device.fromTime) : null,
            })),
          },
          galleryFilter: mapData.galleryFilter && {
            ...mapData.galleryFilter,
            createdAtFrom:
              mapData.galleryFilter.createdAtFrom === undefined
                ? undefined
                : new Date(mapData.galleryFilter.createdAtFrom),
            createdAtTo:
              mapData.galleryFilter.createdAtTo === undefined
                ? undefined
                : new Date(mapData.galleryFilter.createdAtTo),
            takenAtFrom:
              mapData.galleryFilter.takenAtFrom === undefined
                ? undefined
                : new Date(mapData.galleryFilter.takenAtFrom),
            takenAtTo:
              mapData.galleryFilter.takenAtTo === undefined
                ? undefined
                : new Date(mapData.galleryFilter.takenAtTo),
          },
          trackViewer: mapData.trackViewer,
        },
      }),
    );

    dispatch(setActiveModal(null));
  },
};
