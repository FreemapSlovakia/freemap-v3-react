import turfLength from '@turf/length';
import toGeoJSON from '@mapbox/togeojson';
import { IProcessor } from 'fm3/middlewares/processorMiddleware';
import { trackViewerSetData } from 'fm3/actions/trackViewerActions';

export const trackViewerSetTrackDataProcessor: IProcessor<
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

    const trackGeojson = toGeoJSON.gpx(gpxAsXml);

    const startPoints: any[] = []; // TODO
    const finishPoints: any[] = []; // TODO

    for (const feature of trackGeojson.features) {
      if (feature.geometry.type === 'LineString') {
        const lengthInKm = turfLength(feature);
        const coords = feature.geometry.coordinates;
        const startLonlat = coords[0];
        let startTime;
        let finishTime;
        const times = feature.properties.coordTimes;
        if (times) {
          [startTime] = times;
          finishTime = times[times.length - 1];
        }
        startPoints.push({
          lat: startLonlat[1],
          lon: startLonlat[0],
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
