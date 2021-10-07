import turfLength from '@turf/length';
import { TrackPoint } from 'fm3/actions/trackViewerActions';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { assertType } from 'typescript-is';

export function useStartFinishPoints(): readonly [TrackPoint[], TrackPoint[]] {
  const trackGeojson = useSelector((state) => state.trackViewer.trackGeojson);

  const features = trackGeojson?.features;

  return useMemo(() => {
    if (!features) {
      return [[], []];
    }

    const startPoints: TrackPoint[] = [];

    const finishPoints: TrackPoint[] = [];

    for (const feature of features) {
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
    return [startPoints, finishPoints] as const;
  }, [features]);
}
