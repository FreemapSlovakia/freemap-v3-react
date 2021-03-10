import toGeoJSON from '@mapbox/togeojson';
import { FeatureCollection, Geometries } from '@turf/helpers';
import turfLength from '@turf/length';
import { TrackPoint, trackViewerSetData } from 'fm3/actions/trackViewerActions';
import { getMapLeafletElement } from 'fm3/leafletElementHolder';
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
    const gpxAsXml = new DOMParser().parseFromString(
      action.payload.trackGpx,
      'text/xml',
    );

    const trackGeojson = assertType<FeatureCollection<Geometries>>(
      toGeoJSON.gpx(gpxAsXml),
    );

    if (action.payload.focus) {
      const geojsonBounds = geoJSON(trackGeojson).getBounds();

      const le = getMapLeafletElement();

      if (le && geojsonBounds.isValid()) {
        le.fitBounds(geojsonBounds);
      }
    }

    const startPoints: TrackPoint[] = []; // TODO

    const finishPoints: TrackPoint[] = []; // TODO

    for (const feature of trackGeojson.features) {
      if (feature.geometry.type === 'LineString') {
        const lengthInKm = turfLength(feature);

        const coords = feature.geometry.coordinates;

        const startLonlat = coords[0];

        let startTime: Date | undefined;

        let finishTime: Date | undefined;

        const times = assertType<string[] | undefined>(
          feature.properties && feature.properties['coordTimes'],
        );

        if (times) {
          startTime = new Date(times[0]);

          finishTime = new Date(times[times.length - 1]);
        }

        startPoints.push({
          lat: startLonlat[1],
          lon: startLonlat[0],
          lengthInKm: 0,
          startTime,
        });

        const finishLonLat = coords[coords.length - 1];

        finishPoints.push({
          lat: finishLonLat[1],
          lon: finishLonLat[0],
          lengthInKm,
          finishTime,
        });
      }
    }

    trackViewerSetData({
      ...action.payload,
      trackGeojson,
      startPoints,
      finishPoints,
    });

    return {
      ...action,
      payload: {
        ...action.payload,
        trackGeojson,
        startPoints,
        finishPoints,
      },
    };
  },
};
