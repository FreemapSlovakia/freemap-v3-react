import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import {
  dataViewerDeleteVertex,
  dataViewerInsertVertex,
  dataViewerMoveVertex,
  dataViewerSetVertexValues,
} from '../actions.js';

// A drag moves the vertex on every pointer move; one event per feature edited.
let lastIndex: number | undefined;

export const dataViewerVertexEditProcessor: Processor<
  | typeof dataViewerMoveVertex
  | typeof dataViewerInsertVertex
  | typeof dataViewerDeleteVertex
  | typeof dataViewerSetVertexValues
> = {
  actionCreator: [
    dataViewerMoveVertex,
    dataViewerInsertVertex,
    dataViewerDeleteVertex,
    dataViewerSetVertexValues,
  ],
  handle: ({ action, getState }) => {
    const { index } = action.payload;

    const geometry =
      getState().trackViewer.trackGeojson?.features[index]?.geometry.type;

    // Typed in a dialog, so every save is a gesture of its own.
    if (dataViewerSetVertexValues.match(action)) {
      trackMatomo(['trackEvent', 'DataViewer', 'editVertexValues', geometry]);

      return;
    }

    if (index === lastIndex) {
      return;
    }

    lastIndex = index;

    trackMatomo(['trackEvent', 'DataViewer', 'editVertices', geometry]);
  },
};
