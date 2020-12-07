import { Processor } from 'fm3/middlewares/processorMiddleware';
import { MapData, mapsDataLoaded, mapsLoad } from 'fm3/actions/mapsActions';
import { httpRequest } from 'fm3/authAxios';
import { assertType } from 'typescript-is';
import { Line, Point } from 'fm3/actions/drawingLineActions';

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

      const map = assertType<{ data: MapData<Line | OldLine> }>(data).data;

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
        }),
      );
    }
  },
};
