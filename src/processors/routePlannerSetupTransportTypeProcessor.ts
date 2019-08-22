import { routePlannerSetTransportType } from 'fm3/actions/routePlannerActions';
import { IProcessor } from 'fm3/middlewares/processorMiddleware';
import { setTool } from 'fm3/actions/mainActions';

export const routePlannerSetupTransportTypeProcessor: IProcessor = {
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
            ? 'foot'
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
