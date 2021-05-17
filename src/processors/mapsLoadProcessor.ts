import { Line, Point } from 'fm3/actions/drawingLineActions';
import { MapData, mapsDataLoaded, mapsLoad } from 'fm3/actions/mapsActions';
import { httpRequest } from 'fm3/authAxios';
import { Processor } from 'fm3/middlewares/processorMiddleware';
import { StringDates } from 'fm3/types/common';
import { assertType } from 'typescript-is';

interface OldLine {
  type: 'area' | 'distance';
  label?: string;
  points: Point[];
}

export const mapsLoadProcessor: Processor<typeof mapsLoad> = {
  actionCreator: mapsLoad,
  errorKey: 'maps.fetchError',
  handle: async ({ getState, dispatch, action: { payload } }) => {
    if (payload.id === undefined) {
      return;
    }

    const { data } = await httpRequest({
      getState,
      method: 'GET',
      url: `/maps/${payload.id}`,
      expectedStatus: 200,
    });

    const map =
      assertType<{ name: string; data: StringDates<MapData<Line | OldLine>> }>(
        data,
      );

    const mapData = map.data;

    if (mapData.map) {
      if (payload.ignoreMap) {
        delete mapData.map.lat;
        delete mapData.map.lon;
        delete mapData.map.zoom;
      }

      if (payload.ignoreLayers) {
        delete mapData.map.mapType;
        delete mapData.map.overlays;
      }
    }

    dispatch(
      mapsDataLoaded({
        name: map.name,
        merge: payload.merge,
        ...mapData,
        // get rid of OldLines
        lines: mapData.lines?.map(
          (line) =>
            ({
              ...line,
              type:
                line.type === 'area'
                  ? 'polyline'
                  : line.type === 'distance'
                  ? 'line'
                  : line.type,
            } as Line),
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
      }),
    );
  },
};
