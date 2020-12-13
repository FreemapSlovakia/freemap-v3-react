import { selectFeature } from 'fm3/actions/mainActions';
import { routePlannerSetTransportType } from 'fm3/actions/routePlannerActions';
import { Processor } from 'fm3/middlewares/processorMiddleware';

export const routePlannerSetupTransportTypeProcessor: Processor = {
  actionCreator: selectFeature,
  handle: async ({ dispatch, getState }) => {
    const {
      main: { selection },
      routePlanner: { start, finish },
    } = getState();

    if (selection?.type === 'route-planner' && !(start && finish)) {
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
