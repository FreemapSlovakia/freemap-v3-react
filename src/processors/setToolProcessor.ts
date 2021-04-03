import { setTool } from 'fm3/actions/mainActions';
import { Processor } from 'fm3/middlewares/processorMiddleware';
import { isActionOf } from 'typesafe-actions';

export const setToolProcessor: Processor = {
  actionCreator: setTool,
  handle: async ({ getState, action }) => {
    if (isActionOf(setTool, action)) {
      const { tool } = getState().main;

      if (tool) {
        window.gtag('event', 'setTool', {
          event_category: 'Main',
          value: tool,
        });
      }
    }
  },
};
