import { clearMapFeatures, selectFeature } from '@app/store/actions.js';
import type { ProcessorHandler } from '@app/store/middleware/processorMiddleware.js';
import type { RootState } from '@app/store/store.js';
import { fetchElevations } from '@shared/elevation.js';
import { containsElevations, lineSegments } from '@shared/geoutils.js';
import { along } from '@turf/along';
import { distance } from '@turf/distance';
import { getCoord } from '@turf/invariant';
import { length } from '@turf/length';
import { Feature, LineString, MultiLineString, Position } from 'geojson';
import {
  type ElevationWaypoint,
  elevationChartClose,
  elevationChartSetElevationProfile,
  elevationChartSetTrackGeojson,
} from './actions.js';
import type {
  ElevationProfilePoint,
  ElevationProfileWaypoint,
} from './reducer.js';

// A waypoint nearer than this to the track is considered "on" it and pinned to
// the profile; farther ones (a POI off to the side) are omitted.
const WAYPOINT_SNAP_METERS = 100;

const handle: ProcessorHandler<typeof elevationChartSetTrackGeojson> = async ({
  dispatch,
  getState,
  action,
}) => {
  const { trackGeojson, keepRecorded, waypoints } = action.payload;

  // `keepRecorded` shows the recorded elevation verbatim (gaps included); a
  // fully-elevated track is read locally regardless. Everything else samples a
  // complete profile from the server.
  const points =
    keepRecorded || containsElevations(trackGeojson)
      ? resolveElevationProfilePointsLocally(trackGeojson)
      : await resolveElevationProfilePointsViaApi(getState, trackGeojson);

  dispatch(
    elevationChartSetElevationProfile({
      points,
      waypoints: pairWaypoints(points, waypoints),
    }),
  );
};

export default handle;

// Pins each waypoint to the profile at its nearest track point (matching the
// profile's own distance axis), dropping any farther than the snap threshold.
// Self-crossing tracks can mis-snap; good enough until time-based pairing.
function pairWaypoints(
  points: ElevationProfilePoint[],
  waypoints: ElevationWaypoint[],
): ElevationProfileWaypoint[] {
  // Only points with a real elevation can carry a marker (and a y-position).
  const elevated = points.filter((p) => Number.isFinite(p.ele));

  if (elevated.length === 0) {
    return [];
  }

  return waypoints.flatMap((wp) => {
    let nearest = elevated[0]!;

    let nearestMeters = Infinity;

    for (const p of elevated) {
      const d = distance([wp.lon, wp.lat], [p.lon, p.lat], { units: 'meters' });

      if (d < nearestMeters) {
        nearestMeters = d;

        nearest = p;
      }
    }

    return nearestMeters <= WAYPOINT_SNAP_METERS
      ? [{ distance: nearest.distance, ele: nearest.ele, label: wp.label }]
      : [];
  });
}

// A point that breaks the chart line between two recording segments: a
// non-finite `ele` (so the chart splits the line), placed at the segment-end
// distance — no straight-line jump across the pause is counted.
function gapPoint(
  prevTail: Position,
  dist: number,
  climbUp: number,
  climbDown: number,
): ElevationProfilePoint {
  return {
    lat: prevTail[1]!,
    lon: prevTail[0]!,
    ele: Number.NaN,
    distance: dist,
    climbUp,
    climbDown,
  };
}

function resolveElevationProfilePointsLocally(
  trackGeojson: Feature<LineString | MultiLineString>,
): ElevationProfilePoint[] {
  let dist = 0;

  let prevPt: Position | undefined;

  let climbUp = 0;

  let climbDown = 0;

  let prevEle: number | undefined;

  const elevationProfilePoints: ElevationProfilePoint[] = [];

  const segments = lineSegments(trackGeojson.geometry);

  for (let s = 0; s < segments.length; s++) {
    // An interruption between recording segments: break the chart line, reset
    // the climb baseline, and don't count the straight-line jump as distance.
    if (s > 0 && prevPt) {
      elevationProfilePoints.push(gapPoint(prevPt, dist, climbUp, climbDown));

      prevPt = undefined;

      prevEle = undefined;
    }

    for (const pt of segments[s]!) {
      const [lon, lat, ele] = pt;

      if (prevPt) {
        dist += distance([lon, lat], prevPt, { units: 'meters' });
      }

      // A missing `z` breaks the climb accumulation: we don't know the terrain
      // across the gap, so it resets the baseline rather than counting a bogus
      // jump to/from it.
      if (Number.isFinite(ele)) {
        if (prevEle !== undefined) {
          const d = ele! - prevEle;

          if (d > 0) {
            climbUp += d;
          } else {
            climbDown -= d;
          }
        }

        prevEle = ele!;
      } else {
        prevEle = undefined;
      }

      elevationProfilePoints.push({
        lat: lat!,
        lon: lon!,
        // A coordinate without a finite `z` becomes a gap in the chart.
        ele: Number.isFinite(ele) ? ele! : Number.NaN,
        distance: dist,
        climbUp,
        climbDown,
      });

      prevPt = pt;
    }
  }

  return elevationProfilePoints;
}

async function resolveElevationProfilePointsViaApi(
  getState: () => RootState,
  trackGeojson: Feature<LineString | MultiLineString>,
): Promise<ElevationProfilePoint[]> {
  // Sample each segment at ~screen resolution onto a shared distance axis, with
  // a gap entry between segments. `gap` entries keep their non-finite `ele`
  // (no server lookup, no climb across the pause).
  const entries: (ElevationProfilePoint & { gap: boolean })[] = [];

  let cumMeters = 0;

  let prevTail: Position | undefined;

  for (const segment of lineSegments(trackGeojson.geometry)) {
    if (segment.length === 0) {
      continue;
    }

    if (prevTail) {
      entries.push({ ...gapPoint(prevTail, cumMeters, 0, 0), gap: true });
    }

    const line: Feature<LineString> = {
      type: 'Feature',
      properties: {},
      geometry: { type: 'LineString', coordinates: segment },
    };

    const segKm = length(line);

    const delta = Math.min(0.1, segKm / (window.innerWidth / 2));

    if (delta > 0) {
      for (let dist = 0; dist <= segKm; dist += delta) {
        const [lon, lat] = getCoord(along(line, dist));

        entries.push({
          lat,
          lon,
          distance: cumMeters + dist * 1000,
          ele: Number.NaN, // filled below
          gap: false,
        });
      }
    } else {
      // A zero-length segment (all points coincide): sample its single point.
      const [lon, lat] = segment[0]!;

      entries.push({
        lat: lat!,
        lon: lon!,
        distance: cumMeters,
        ele: Number.NaN,
        gap: false,
      });
    }

    cumMeters += segKm * 1000;

    prevTail = segment.at(-1);
  }

  const sampled = entries.filter((e) => !e.gap);

  const eles = await fetchElevations(
    sampled.map(({ lat, lon }) => [lat, lon]),
    getState,
    [
      elevationChartSetTrackGeojson,
      selectFeature,
      elevationChartClose,
      clearMapFeatures,
    ],
  );

  let climbUp = 0;

  let climbDown = 0;

  let prevEle: number | undefined;

  let i = 0;

  for (const entry of entries) {
    // A gap (segment boundary) breaks the climb accumulation, as does a no-data
    // point (null): we don't know the terrain across it, so the baseline resets
    // rather than counting a bogus jump.
    if (entry.gap) {
      prevEle = undefined;

      entry.climbUp = climbUp;

      entry.climbDown = climbDown;

      continue;
    }

    const ele = eles[i++];

    if (prevEle !== undefined && ele != null) {
      const d = ele - prevEle;

      if (d > 0) {
        climbUp += d;
      } else {
        climbDown -= d;
      }
    }

    // TODO following are computed data, should not go to store
    entry.ele = ele ?? Number.NaN;

    entry.climbUp = climbUp;

    entry.climbDown = climbDown;

    prevEle = ele ?? undefined;
  }

  return entries.map(({ gap: _gap, ...point }) => point);
}
