import { assert } from 'typia';
import { authLogout, authSetUser } from '../actions/authActions.js';
import { Line, Point } from '../actions/drawingLineActions.js';
import {
  MapData,
  MapMeta,
  mapsLoad,
  mapsLoaded,
} from '../actions/mapsActions.js';
import { httpRequest } from '../httpRequest.js';
import { Processor } from '../middlewares/processorMiddleware.js';
import { StringDates } from '../types/common.js';

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

    // backward compat.
    try {
      const { routePlanner } = data.data;

      if (routePlanner.transportType === 'bike') {
        routePlanner.transportType = 'bicycle_touring';
      } else if (routePlanner.transportType.startsWith('car-')) {
        routePlanner.transportType = 'car';
      }
    } catch {
      // ignore
    }

    const map = assert<
      StringDates<{
        meta: MapMeta;
        data: MapData<Line | CompatLine, CompatDrawingPoint>;
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
        delete mapData.map.mapType;

        delete mapData.map.overlays;
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
          points: mapData.points?.map((point) => ({
            ...point,
          })),
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
  },
};
