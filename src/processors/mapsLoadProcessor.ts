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
    if (payload.id !== undefined) {
      const { data } = await httpRequest({
        getState,
        method: 'GET',
        url: `/maps/${payload.id}`,
        expectedStatus: 200,
      });

      const map = assertType<{ data: StringDates<MapData<Line | OldLine>> }>(
        data,
      ).data;

      if (map.map) {
        if (payload.ignoreMap) {
          delete map.map.lat;
          delete map.map.lon;
          delete map.map.zoom;
        }

        if (payload.ignoreLayers) {
          delete map.map.mapType;
          delete map.map.overlays;
        }
      }

      dispatch(
        mapsDataLoaded({
          ...map,
          // get rid of OldLines
          lines: map.lines?.map(
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
          tracking: map.tracking && {
            ...map.tracking,
            trackedDevices: map.tracking.trackedDevices.map((device) => ({
              ...device,
              fromTime: device.fromTime ? new Date(device.fromTime) : null,
            })),
          },
          galleryFilter: map.galleryFilter && {
            ...map.galleryFilter,
            createdAtFrom:
              map.galleryFilter.createdAtFrom === undefined
                ? undefined
                : new Date(map.galleryFilter.createdAtFrom),
            createdAtTo:
              map.galleryFilter.createdAtTo === undefined
                ? undefined
                : new Date(map.galleryFilter.createdAtTo),
            takenAtFrom:
              map.galleryFilter.takenAtFrom === undefined
                ? undefined
                : new Date(map.galleryFilter.takenAtFrom),
            takenAtTo:
              map.galleryFilter.takenAtTo === undefined
                ? undefined
                : new Date(map.galleryFilter.takenAtTo),
          },
          trackViewer: map.trackViewer && {
            ...map.trackViewer,
            startPoints: map.trackViewer.startPoints.map((point) => ({
              ...point,
              startTime:
                point.startTime === undefined
                  ? undefined
                  : new Date(point.startTime),
              finishTime:
                point.finishTime === undefined
                  ? undefined
                  : new Date(point.finishTime),
            })),
            finishPoints: map.trackViewer.finishPoints.map((point) => ({
              ...point,
              startTime:
                point.startTime === undefined
                  ? undefined
                  : new Date(point.startTime),
              finishTime:
                point.finishTime === undefined
                  ? undefined
                  : new Date(point.finishTime),
            })),
          },
        }),
      );
    }
  },
};
