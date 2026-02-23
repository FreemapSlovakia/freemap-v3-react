import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { mapPromise } from '@features/map/hooks/leafletElementHolder.js';
import { trackViewerSetData } from '@features/trackViewer/model/actions.js';
import * as toGeoJSON from '@tmcw/togeojson';
import bbox from '@turf/bbox';
import { FeatureCollection } from 'geojson';
import { assert } from 'typia';

export const trackViewerSetTrackDataProcessor: Processor<
  typeof trackViewerSetData
> = {
  actionCreator: trackViewerSetData,
  transform: ({ action }) => {
    if (!action.payload.trackGpx) {
      return action;
    }

    // TODO add error handling for failed string-to-gpx and gpx-to-geojson parsing
    const gpxAsXml = new DOMParser().parseFromString(
      action.payload.trackGpx,
      'text/xml',
    );

    const trackGeojson = assert<FeatureCollection>(toGeoJSON.gpx(gpxAsXml));

    if (action.payload.focus) {
      let bounds;

      try {
        bounds = bbox(trackGeojson);
      } catch {}

      if (bounds) {
        mapPromise.then((map) =>
          map.fitBounds([
            [bounds[1], bounds[0]],
            [bounds[3], bounds[2]],
          ]),
        );
      }
    }

    return trackViewerSetData({
      ...action.payload,
      trackGeojson,
    });
  },
};
