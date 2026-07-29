import type {
  Alternative,
  RoutingMode,
  StepCoordinate,
  StepMode,
  Waypoint,
} from './actions.js';

/** Route line color per transport mode, as the map draws it. */
export const STEP_MODE_COLORS: Record<StepMode, string> = {
  manual: '#868e96',
  cycling: '#968dfd',
  driving: '#25a6fd',
  walking: '#1db2c0',
  'pushing bike': '#1db2c0',
  foot: '#1db2c0',
  ferry: '#3060ff',
  train: '#000',
  error: '#f00',
};

/** Color of an alternative the user isn't following, as the map draws it. */
export const INACTIVE_ALTERNATIVE_COLOR = '#868e96';

// Modes with no real path to follow — a straight manual segment, a bike being
// pushed, a ferry crossing, a leg that failed to route — which the map draws
// dotted rather than solid.
const DASHED_STEP_MODES: ReadonlySet<StepMode> = new Set([
  'manual',
  'pushing bike',
  'ferry',
  'error',
]);

/** Dash pattern of a stretch, or undefined when the map draws it solid. */
export function stepModeDashArray(mode: StepMode): number[] | undefined {
  return DASHED_STEP_MODES.has(mode) ? [0, 10] : undefined;
}

/** A stretch of an alternative drawn in one color. */
export interface RouteModeRun {
  mode: StepMode;
  coordinates: StepCoordinate[];
}

/**
 * The alternative as contiguous same-mode stretches, joined across leg and step
 * boundaries. Lets an export mirror the map's per-mode coloring instead of
 * flattening a multimodal route into one line. Consecutive steps share their
 * boundary vertex, so the duplicate is dropped.
 */
export function routeModeRuns(alternative: Alternative): RouteModeRun[] {
  const runs: RouteModeRun[] = [];

  for (const leg of alternative.legs) {
    for (const step of leg.steps) {
      let run = runs.at(-1);

      if (!run || run.mode !== step.mode) {
        run = { mode: step.mode, coordinates: [] };

        runs.push(run);
      }

      for (const coordinate of step.geometry.coordinates) {
        const prev = run.coordinates.at(-1);

        if (!prev || prev[0] !== coordinate[0] || prev[1] !== coordinate[1]) {
          run.coordinates.push(coordinate);
        }
      }
    }
  }

  // A mode change breaks the line, so the next run has to start where the
  // previous one ended or the two colors would leave a gap between them.
  // Consecutive steps usually already share that vertex, so only add it when
  // they don't.
  for (let i = 1; i < runs.length; i++) {
    const prevEnd = runs[i - 1].coordinates.at(-1);

    const start = runs[i].coordinates[0];

    if (
      prevEnd &&
      (!start || prevEnd[0] !== start[0] || prevEnd[1] !== start[1])
    ) {
      runs[i].coordinates.unshift(prevEnd);
    }
  }

  return runs.filter((run) => run.coordinates.length >= 2);
}

/**
 * The mode covering the most distance. Gives the color and dash for the
 * consumers that can't split a route into per-mode stretches — a drawing line,
 * a GPX track, one feature per alternative.
 */
export function dominantStepMode(alternative: Alternative): StepMode {
  const byMode = new Map<StepMode, number>();

  for (const leg of alternative.legs) {
    for (const step of leg.steps) {
      byMode.set(step.mode, (byMode.get(step.mode) ?? 0) + step.distance);
    }
  }

  let best: StepMode = 'foot';

  let bestDistance = -1;

  for (const [mode, distance] of byMode) {
    if (distance > bestDistance) {
      best = mode;

      bestDistance = distance;
    }
  }

  return best;
}

/** What a waypoint stands for; drives its marker color, glyph and name. */
export type WaypointKind = 'start' | 'finish' | 'stop';

/** Waypoint marker colors, as the map draws them (unselected). */
export const WAYPOINT_COLORS: Record<WaypointKind, string> = {
  start: '#409a40',
  finish: '#d9534f',
  stop: '#3e64d5',
};

/** Font Awesome glyph inside a waypoint's marker; stops carry their number. */
export const WAYPOINT_ICONS: Partial<Record<WaypointKind, string>> = {
  start: 'fa:play',
  finish: 'fa:stop',
};

/**
 * The number a stop is marked with, as the map draws it: its own position for a
 * point-to-point route, the router's visiting order for the modes that reorder
 * the waypoints.
 */
export function stopNumber(
  index: number,
  mode: RoutingMode,
  waypoints: Waypoint[],
): number | undefined {
  return mode === 'route' ? index : waypoints[index]?.waypoint_index;
}

/**
 * What the `index`-th of `count` waypoints stands for. A roundtrip returns to
 * its start, so its last waypoint is a stop rather than a finish; in
 * finish-only mode the first waypoint isn't a start.
 */
export function waypointKind(
  index: number,
  count: number,
  finishOnly: boolean,
  mode: RoutingMode,
): WaypointKind {
  return index === 0 && !finishOnly
    ? 'start'
    : index === count - 1 && mode !== 'roundtrip'
      ? 'finish'
      : 'stop';
}
