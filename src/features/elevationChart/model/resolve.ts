import type { RootAction } from '@app/store/rootAction.js';
import type { RootState } from '@app/store/store.js';
import { activeTrackGeometry } from '@features/dataViewer/trackSelection.js';
import type {
  Feature,
  FeatureCollection,
  LineString,
  MultiLineString,
} from 'geojson';
import type { Dispatch } from 'redux';
import type { ElevationCredit, ElevationWaypoint } from './actions.js';
import type {
  ElevationChartTarget,
  ElevationChartTargetType,
} from './target.js';

/** The line a target resolves to, and what the chart needs to draw it. */
export interface ResolvedProfileSource {
  trackGeojson: Feature<LineString | MultiLineString>;
  /**
   * Render the feature's own elevation as-is (gaps included) instead of
   * sampling a complete profile from the elevation API.
   */
  keepRecorded: boolean;
  waypoints: ElevationWaypoint[];
  credit: ElevationCredit;
}

/**
 * What a target resolves to. "Nothing to draw" is two different answers, and
 * the chart must not confuse them:
 *
 * - `pending` — the line isn't there *yet*. A route is being recomputed (which
 *   is what switching transport type does), a track is still downloading, a
 *   device hasn't reported. Keep the chart aimed; the redraw comes when it
 *   lands.
 * - `gone` — nothing is coming. The line was deleted, the track cleared, the
 *   device isn't tracked. Close the chart.
 *
 * Only the feature can tell these apart, so it says which rather than
 * returning a bare `null` for the chart to guess at.
 */
export type ChartResolution =
  | { status: 'ok'; source: ResolvedProfileSource }
  | { status: 'pending' }
  | { status: 'gone' };

export type ProfileResolver = (
  getState: () => RootState,
  dispatch: Dispatch<RootAction>,
) => Promise<ChartResolution>;

// Per collection, scanned once. The list last made is handed back while the
// points are the same objects, so an edit elsewhere leaves the identity alone.
const pointsOf = new WeakMap<FeatureCollection, Feature[]>();

let lastPoints: Feature[] = [];

function pointFeatures(fc: FeatureCollection | null): Feature[] {
  if (!fc) {
    if (lastPoints.length > 0) {
      lastPoints = [];
    }

    return lastPoints;
  }

  let points = pointsOf.get(fc);

  if (!points) {
    const found = fc.features.filter(
      ({ geometry }) => geometry?.type === 'Point',
    );

    points =
      found.length === lastPoints.length &&
      found.every((point, i) => point === lastPoints[i])
        ? lastPoints
        : found;

    lastPoints = points;

    pointsOf.set(fc, points);
  }

  return points;
}

const NONE = {};

const pairs = new WeakMap<object, WeakMap<object, object>>();

/** One object per pair, so `!==` tells whether either changed. */
function pairOf(a: object | undefined, b: object): object {
  let byB = pairs.get(a ?? NONE);

  if (!byB) {
    byB = new WeakMap();

    pairs.set(a ?? NONE, byB);
  }

  let pair = byB.get(b);

  if (!pair) {
    pair = {};

    byB.set(b, pair);
  }

  return pair;
}

/**
 * What the target's profile is derived from, as a single reference — cheap
 * enough to run on every action, since it is the chart processor's trigger.
 *
 * This is the whole redraw rule. A re-route, a switched alternative, a
 * densified render line, a reshaped drawn line, a refilled track elevation, an
 * arriving position: each replaces the object named here, and nothing else
 * does. So the processor needs no list of the actions that cause them, and an
 * action that changes something *else* — the commonest case, and the reason a
 * per-feature processor kept redrawing needlessly — leaves this identical and
 * costs one reference compare.
 *
 * Returns `undefined` when there is nothing to chart, which never equals a
 * previous line and so lets a target that has just become resolvable through.
 */
export function chartIdentity(state: RootState): unknown {
  const { target } = state.elevationChart;

  switch (target?.type) {
    case 'route-planner': {
      const { renderGeojson, alternatives, activeAlternativeIndex } =
        state.routePlanner;

      return renderGeojson ?? alternatives[activeAlternativeIndex];
    }

    case 'track-viewer':
      // The active line's geometry, which a restyle leaves as it is — a line
      // with no elevation is sampled from the API, and a colour change must not
      // pay for that again. The densified copy replaces the lot when it lands.
      // The points too: they are the profile's waypoint markers.
      return pairOf(
        state.trackViewer.renderTrackGeojson ??
          activeTrackGeometry(state.trackViewer),
        pointFeatures(state.trackViewer.trackGeojson),
      );

    case 'gps-recorder':
      // The fixes as they arrived, not the segments they are split into:
      // splitting is a pass over the whole track, and this runs twice per
      // dispatched action. The split's own input — `splitGapS` — is listened
      // for instead, through `gpsRecorderSetSettings`.
      return state.gpsRecorder.points;

    case 'tracking':
      return state.tracking.tracks.find(
        (track) => track.token === target.token,
      );

    default:
      return undefined;
  }
}

/**
 * The heavy half, loaded per target: a resolver may densify, and pulls in the
 * elevation-sampling path with it, so it stays out of the main chunk.
 */
export function loadResolver(
  type: ElevationChartTargetType,
): Promise<ProfileResolver> {
  switch (type) {
    case 'route-planner':
      return import(
        /* webpackChunkName: "route-planner-elevation-chart-resolver" */
        '@features/routePlanner/model/resolveElevationChart.js'
      ).then((m) => m.default);

    case 'track-viewer':
      return import(
        /* webpackChunkName: "data-viewer-elevation-chart-resolver" */
        '@features/dataViewer/model/resolveElevationChart.js'
      ).then((m) => m.default);

    case 'gps-recorder':
      return import(
        /* webpackChunkName: "gps-recorder-elevation-chart-resolver" */
        '@features/gpsRecorder/resolveElevationChart.js'
      ).then((m) => m.default);

    case 'tracking':
      return import(
        /* webpackChunkName: "tracking-elevation-chart-resolver" */
        '@features/tracking/resolveElevationChart.js'
      ).then((m) => m.default);
  }
}

export type { ElevationChartTarget };
