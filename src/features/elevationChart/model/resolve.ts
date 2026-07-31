import type { RootAction } from '@app/store/rootAction.js';
import type { RootState } from '@app/store/store.js';
import type { Feature, LineString, MultiLineString } from 'geojson';
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
      // The whole collection, not the active feature within it: resolving that
      // means scanning every imported feature, and this runs for both the new
      // and the previous state on every dispatched action. Which track is
      // active is caught by `trackViewerSetSelectedTrack` instead.
      return (
        state.trackViewer.renderTrackGeojson ?? state.trackViewer.trackGeojson
      );

    case 'drawing':
      // The points, not the line: restyling replaces the line object, and
      // keying on that would re-sample the whole profile from the elevation API
      // for a colour change. `drawingLineChangeProperties` assigns onto the
      // line, so the points array survives a restyle untouched.
      return state.drawingLines.lines.find((line) => line.id === target.lineId)
        ?.points;

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

    case 'drawing':
      return import(
        /* webpackChunkName: "drawing-elevation-chart-resolver" */
        '@features/drawing/model/resolveElevationChart.js'
      ).then((m) => m.default);

    case 'tracking':
      return import(
        /* webpackChunkName: "tracking-elevation-chart-resolver" */
        '@features/tracking/resolveElevationChart.js'
      ).then((m) => m.default);
  }
}

export type { ElevationChartTarget };
