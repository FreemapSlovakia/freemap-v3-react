import { length as turfLength } from '@turf/length';
import { useMemo } from 'react';
import { assert } from 'typia';
import { TrackPoint } from '../model/actions.js';
import { useAppSelector } from '../../../hooks/useAppSelector.js';

export function useStartFinishPoints(): readonly [TrackPoint[], TrackPoint[]] {
  const trackGeojson = useAppSelector(
    (state) => state.trackViewer.trackGeojson,
  );

  const features = trackGeojson?.features;

  return useMemo(() => {
    if (!features) {
      return [[], []];
    }

    const startPoints: TrackPoint[] = [];

    const finishPoints: TrackPoint[] = [];

    for (const feature of features) {
      if (feature.geometry.type === 'LineString') {
        const length = turfLength(feature, { units: 'meters' });

        const coords = feature.geometry.coordinates;

        const startLonlat = coords[0];

        let startTime: Date | undefined;

        let finishTime: Date | undefined;

        const times = assert<string[] | undefined>(
          feature.properties && feature.properties['coordTimes'],
        );

        if (times) {
          startTime = new Date(times[0]);

          finishTime = new Date(times.at(-1)!);
        }

        startPoints.push({
          lat: startLonlat[1],
          lon: startLonlat[0],
          length: 0,
          startTime,
        });

        const finishLonLat = coords.at(-1)!;

        finishPoints.push({
          lat: finishLonLat[1],
          lon: finishLonLat[0],
          length,
          finishTime,
        });
      }
    }

    return [startPoints, finishPoints] as const;
  }, [features]);
}
