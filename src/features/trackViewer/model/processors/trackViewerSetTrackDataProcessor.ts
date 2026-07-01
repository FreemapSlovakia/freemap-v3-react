import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { fitMapToBbox } from '@features/map/fitMapToBbox.js';
import { trackViewerSetData } from '@features/trackViewer/model/actions.js';
import bbox from '@turf/bbox';

export const trackViewerSetTrackDataProcessor: Processor<
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
