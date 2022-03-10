import { gpx, kml } from '@tmcw/togeojson';
import { FeatureCollection, Geometries } from '@turf/helpers';
import { DOMParser } from '@xmldom/xmldom';
import { trackViewerSetData } from 'fm3/actions/trackViewerActions';
import { mapPromise } from 'fm3/leafletElementHolder';
import { Processor } from 'fm3/middlewares/processorMiddleware';
import { geoJSON } from 'leaflet';
import { assertType } from 'typescript-is';

export const trackViewerSetTrackDataProcessor: Processor<
  typeof trackViewerSetData
> = {
  actionCreator: trackViewerSetData,
  transform: ({ action }) => {
    if (!action.payload.trackGpx) {
      return action;
    }

    // TODO add error handling for failed string-to-gpx and gpx-to-geojson parsing
    const xml = new DOMParser().parseFromString(
      action.payload.trackGpx,
      'text/xml',
    );

    let trackGeojson;

    try {
      trackGeojson = assertType<FeatureCollection<Geometries>>(gpx(xml));

      if (trackGeojson.features.length === 0) {
        throw new Error();
      }
    } catch {
      trackGeojson = assertType<FeatureCollection<Geometries>>(kml(xml));

      trackGeojson.features = trackGeojson.features.filter((f) => f.geometry);
    }

    console.log(trackGeojson);

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
