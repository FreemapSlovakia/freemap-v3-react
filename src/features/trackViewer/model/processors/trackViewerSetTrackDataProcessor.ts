import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { mapPromise } from '@features/map/hooks/leafletElementHolder.js';
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

      // bbox returns Infinity for empty geometry and NaN for invalid
      // coordinates; both make Leaflet's fitBounds throw "Invalid LatLng".
      if (bounds && bounds.every((n) => Number.isFinite(n))) {
        mapPromise.then((map) =>
          map.fitBounds([
            [bounds[1], bounds[0]],
            [bounds[3], bounds[2]],
          ]),
        );
      }
    }

    return action;
  },
};
