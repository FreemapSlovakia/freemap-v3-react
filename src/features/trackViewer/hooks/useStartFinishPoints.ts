import { lineSegments } from '@shared/geoutils.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { length as turfLength } from '@turf/length';
import type { Feature, LineString, MultiLineString, Position } from 'geojson';
import { useMemo } from 'react';
import { TrackPoint } from '../model/actions.js';
import { isTrackOrRoute } from '../provenance.js';

const isLineLike = (f: Feature): f is Feature<LineString | MultiLineString> =>
  f.geometry.type === 'LineString' || f.geometry.type === 'MultiLineString';

// togeojson stores per-point times under `coordinateProperties.times` (nested
// per segment for a multi-segment track); live tracking writes a flat
// top-level `coordTimes`. Returns the very first and very last timestamp.
function endpointTimes(feature: Feature): [Date | undefined, Date | undefined] {
  const cp = feature.properties?.['coordinateProperties'] as
    | { times?: unknown }
    | undefined;

  const raw = cp?.times ?? feature.properties?.['coordTimes'];

  if (!Array.isArray(raw) || raw.length === 0) {
    return [undefined, undefined];
  }

  const head = raw[0];

  const tail = raw.at(-1);

  const first = Array.isArray(head) ? head[0] : head;

  const last = Array.isArray(tail) ? tail.at(-1) : tail;

  const toDate = (v: unknown) => {
    if (typeof v !== 'string') {
      return undefined;
    }

    const d = new Date(v);

    return Number.isNaN(d.getTime()) ? undefined : d;
  };

  return [toDate(first), toDate(last)];
}

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
      if (!isLineLike(feature) || !isTrackOrRoute(feature)) {
        continue;
      }

      const segments = lineSegments(feature.geometry).filter(
        (segment) => segment.length > 0,
      );

      const start: Position | undefined = segments[0]?.[0];

      const finish: Position | undefined = segments.at(-1)?.at(-1);

      if (!start || !finish) {
        continue;
      }

      const [startTime, finishTime] = endpointTimes(feature);

      startPoints.push({
        lat: start[1]!,
        lon: start[0]!,
        length: 0,
        startTime,
      });

      finishPoints.push({
        lat: finish[1]!,
        lon: finish[0]!,
        length: turfLength(feature, { units: 'meters' }),
        finishTime,
      });
    }

    return [startPoints, finishPoints] as const;
  }, [features]);
}
