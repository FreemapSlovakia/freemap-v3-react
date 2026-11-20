import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { changesetsEndInspection } from '@features/changesets/model/inspection.js';
import { routePlannerSetPanelOpen } from '../actions.js';

/** The route panel coming ends an inspection docked before it. */
export const routePanelEndsInspectionProcessor: Processor<
  typeof routePlannerSetPanelOpen
> = {
  actionCreator: routePlannerSetPanelOpen,
  actionPredicate: (action) => action.payload,
  statePredicate: (state) => state.changesetInspector.inspected !== null,
  handle: async ({ dispatch }) => {
    for (const action of changesetsEndInspection()) {
      dispatch(action);
    }
  },
};
