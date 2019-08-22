import storage from 'fm3/storage';
import { routePlannerPreventHint } from 'fm3/actions/routePlannerActions';
import { IProcessor } from 'fm3/middlewares/processorMiddleware';

export const routePlannerPreventHintProcssor: IProcessor = {
  actionCreator: routePlannerPreventHint,
  handle: async () => {
    storage.setItem('routePlannerPreventHint', '1');
  },
};
