import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { trackViewerSetData } from '@features/dataViewer/model/actions.js';
import { fitMapToBbox } from '@features/map/fitMapToBbox.js';
import bbox from '@turf/bbox';

export const dataViewerSetTrackDataProcessor: Processor<
  typeof trackViewerSetData
> = {
  actionCreator: trackViewerSetData,
  transform: ({ action }) => {
    const { focus, trackGeojson } = action.payload;

    if (focus && trackGeojson) {
      let bounds;

      try {
        bounds = bbox(trackGeojson);
      } catch {}

      if (bounds) {
        fitMapToBbox([bounds[0], bounds[1], bounds[2], bounds[3]]);
      }
    }

    return action;
  },
};
