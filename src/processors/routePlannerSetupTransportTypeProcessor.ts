import { setTool } from 'fm3/actions/mainActions';
import { routePlannerSetTransportType } from 'fm3/actions/routePlannerActions';
import { Processor } from 'fm3/middlewares/processorMiddleware';

export const routePlannerSetupTransportTypeProcessor: Processor = {
  actionCreator: setTool,
  handle: async ({ dispatch, getState }) => {
    const {
      main: { tool },
      routePlanner: { start, finish },
    } = getState();

    if (tool === 'route-planner' && !(start && finish)) {
      const { mapType } = getState().map;

      dispatch(
        routePlannerSetTransportType(
          ['T', 'p', 'X'].includes(mapType)
            ? 'foot-osm'
            : mapType === 'K'
            ? 'nordic'
            : ['C', 'M'].includes(mapType)
            ? 'bike'
            : mapType === 'd'
            ? 'imhd'
            : 'car',
        ),
      );
    }
  },
};
