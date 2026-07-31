import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useMemo } from 'react';
import type { TrackPoint } from '../model/actions.js';
import { isTrackOrRoute } from '../provenance.js';
import { trackEndpoints } from '../trackEndpoints.js';
import { isTrackLine } from '../trackSelection.js';

/**
 * Start/finish markers for the loaded geodata: one pair per recorded track or
 * planned route (`fm:kind`), never for generic imported geometry — that would
 * just clutter a KML/GeoJSON full of lines. A multi-segment recording (a single
 * `MultiLineString`) is one track: one start, one finish, total distance
 * summed across its segments (the inter-segment gap doesn't count).
 */
export function useStartFinishPoints(): readonly [TrackPoint[], TrackPoint[]] {
  const features = useAppSelector(
    (state) => state.trackViewer.trackGeojson?.features,
  );

  return useMemo(() => {
    if (!features) {
      return [[], []];
    }

    const startPoints: TrackPoint[] = [];

    const finishPoints: TrackPoint[] = [];

    for (const feature of features) {
      if (!isTrackLine(feature) || !isTrackOrRoute(feature)) {
        continue;
      }

      const endpoints = trackEndpoints(feature);

      if (!endpoints) {
        continue;
      }

      const { start, finish, startTime, finishTime, length } = endpoints;

      startPoints.push({
        lat: start[1]!,
        lon: start[0]!,
        length: 0,
        startTime,
      });

      finishPoints.push({
        lat: finish[1]!,
        lon: finish[0]!,
        length,
        finishTime,
      });
    }

    return [startPoints, finishPoints] as const;
  }, [features]);
}
