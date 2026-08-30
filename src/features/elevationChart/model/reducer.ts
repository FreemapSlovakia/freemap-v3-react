import {
  clearMapFeatures,
  closeTool,
  openTool,
  type Tool,
} from '@app/store/actions.js';
import { createReducer } from '@reduxjs/toolkit';
import { isMapClickTool } from '@shared/toolDefinitions.js';
import type { LatLon } from '@shared/types/common.js';
import {
  type ElevationProvenance,
  elevationChartClose,
  elevationChartOpen,
  elevationChartSetActivePoint,
  elevationChartSetElevationProfile,
  elevationChartSetRange,
} from './actions.js';
import {
  type ElevationChartTarget,
  type ElevationChartTargetType,
  targetsEqual,
} from './target.js';

export interface ElevationProfilePoint extends LatLon {
  climbUp?: number;
  climbDown?: number;
  distance: number;
  ele: number;
}

// A waypoint paired onto the profile: its position on the distance axis and the
// elevation of the nearest track point, plus its name for the label.
export interface ElevationProfileWaypoint {
  distance: number;
  ele: number;
  label?: string;
}

/** A marked-out stretch of a profile, in metres along it. */
export interface ChartRange {
  from: number;
  to: number;
}

export interface ElevationChartState {
  /**
   * What the chart is showing, or `null` when it is closed. The geometry itself
   * is never stored: `elevationChartProcessor` resolves this against current
   * state every time what it points at changes, which is what keeps the profile
   * in step with a re-route, a reshaped line or an arriving position.
   */
  target: ElevationChartTarget | null;
  activePoint: ElevationProfilePoint | null;
  /** The marked-out stretch; `null` for none. */
  range: ChartRange | null;
  elevationProfilePoints: Array<ElevationProfilePoint> | null;
  waypoints: ElevationProfileWaypoint[];
  /**
   * The terrain models the elevation API named for the shown profile, as source
   * tokens; empty when it named none, in which case the profile credits nobody.
   * Unrelated to `target`: these are what the numbers were read from, that is
   * what they describe.
   */
  sources: string[];
  /** What the shown profile's elevation is credited to; `null` when none is. */
  provenance: ElevationProvenance | null;
}

const initialState: ElevationChartState = {
  target: null,
  activePoint: null,
  range: null,
  elevationProfilePoints: null,
  waypoints: [],
  sources: [],
  provenance: null,
};

// The tool whose closing takes the chart with it. A drawn line is charted by id
// and outlives any tool, so it has none.
const targetTools: Record<ElevationChartTargetType, Tool | undefined> = {
  'route-planner': 'route-planner',
  'track-viewer': 'import-file',
  'gps-recorder': 'gps-recorder',
  tracking: 'tracking',
  drawing: undefined,
};

export const elevationChartReducer = createReducer(initialState, (builder) =>
  builder
    // Re-aiming at what is already charted keeps the profile on screen; a new
    // target starts clean rather than showing the old line's elevation under
    // the new one's name.
    .addCase(elevationChartOpen, (state, { payload }) =>
      targetsEqual(state.target, payload.target)
        ? state
        : { ...initialState, target: payload.target },
    )
    .addCase(elevationChartSetActivePoint, (state, action) => {
      state.activePoint = action.payload;
    })
    .addCase(elevationChartSetRange, (state, action) => {
      // Kept to the profile it marks, since it can be asked for by URL. A
      // profile still on its way is not one to measure against; the one that
      // arrives clamps it instead.
      state.range = state.elevationProfilePoints
        ? clampRange(action.payload, state.elevationProfilePoints)
        : action.payload;
    })
    .addCase(elevationChartSetElevationProfile, (state, action) => {
      state.elevationProfilePoints = action.payload.points;

      // A profile redrawn shorter — a re-route, a track edited — can end before
      // the marked stretch does. What is left of it stands; nothing does not.
      const clamped = clampRange(state.range, action.payload.points);

      // Only when it actually moved: a live track dispatches a profile per fix,
      // and a new object each time would redraw the band and re-scan the
      // profile for its figures on every one of them.
      if (
        clamped?.from !== state.range?.from ||
        clamped?.to !== state.range?.to
      ) {
        state.range = clamped;
      }

      state.waypoints = action.payload.waypoints;

      state.sources = action.payload.sources;

      state.provenance = action.payload.provenance;
    })
    // Clear the chart once the tool that owns its target is closed.
    .addCase(closeTool, (state, action) =>
      state.target && targetTools[state.target.type] === action.payload
        ? initialState
        : state,
    )
    // Opening a map-click tool closes the one that had the slot, and does it
    // without an action of its own — so the chart of a tool losing the slot goes
    // here, as it would on that tool's own close button.
    .addCase(openTool, (state, action) => {
      const owner = state.target && targetTools[state.target.type];

      return owner &&
        owner !== action.payload &&
        isMapClickTool(owner) &&
        isMapClickTool(action.payload)
        ? initialState
        : state;
    })
    .addCase(clearMapFeatures, setInitialState)
    .addCase(elevationChartClose, setInitialState),
);

function setInitialState() {
  return initialState;
}

/** A marked stretch kept within a profile; `null` where nothing of it is left. */
function clampRange(
  range: ChartRange | null,
  points: ElevationProfilePoint[],
): ChartRange | null {
  if (!range) {
    return null;
  }

  const end = points.at(-1)?.distance ?? 0;

  const from = Math.min(range.from, end);

  const to = Math.min(range.to, end);

  return to > from ? { from, to } : null;
}
