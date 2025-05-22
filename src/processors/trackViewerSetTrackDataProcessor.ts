import * as toGeoJSON from '@tmcw/togeojson';
import { FeatureCollection } from 'geojson';
import { geoJSON } from 'leaflet';
import { assert } from 'typia';
import { trackViewerSetData } from '../actions/trackViewerActions.js';
import { mapPromise } from '../leafletElementHolder.js';
import type { Processor } from '../middlewares/processorMiddleware.js';

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
      const geojsonBounds = geoJSON(trackGeojson).getBounds();

      if (geojsonBounds.isValid()) {
        mapPromise.then((map) => map.fitBounds(geojsonBounds));
      }
    }

    return trackViewerSetData({
      ...action.payload,
      trackGeojson,
    });
  },
};
