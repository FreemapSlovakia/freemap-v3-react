import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import { weatherForecastSetPicking } from './actions.js';

/** Counts each start of the pick, from wherever it came. */
export const weatherForecastPickTrackingProcessor: Processor<
  typeof weatherForecastSetPicking
> = {
  actionCreator: weatherForecastSetPicking,
  actionPredicate: (action) => action.payload,
  handle: async () => {
    trackMatomo(['trackEvent', 'Weather', 'pick']);
  },
};
