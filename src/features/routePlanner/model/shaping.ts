import type { RoutingMode } from './actions.js';

type MaybeShaping = { shaping?: boolean } | null | undefined;

/**
 * Whether the waypoint at `index` only shapes the route: an inner point of a
 * route through the points in order, routed through but neither numbered,
 * timed nor stopped at.
 */
export function isShaping(
  points: readonly MaybeShaping[],
  index: number,
  mode: RoutingMode,
): boolean {
  return (
    mode === 'route' &&
    index > 0 &&
    index < points.length - 1 &&
    Boolean(points[index]?.shaping)
  );
}

/**
 * The first and last leg of the stretch between two real waypoints that holds
 * `leg`: shaping points join the legs on either side of them.
 */
export function stretchBounds(
  points: readonly MaybeShaping[],
  mode: RoutingMode,
  leg: number,
): [from: number, to: number] {
  let from = leg;

  let to = leg;

  while (isShaping(points, from, mode)) {
    from--;
  }

  while (isShaping(points, to + 1, mode)) {
    to++;
  }

  return [from, to];
}

type Timed = { distance: number; duration: number };

/** The stretch holding `leg`: its bounds, its legs and what they add up to. */
export function joinStretch<L extends Timed>(
  points: readonly MaybeShaping[],
  mode: RoutingMode,
  legs: readonly L[],
  leg: number,
): {
  bounds: [from: number, to: number];
  joined: L[];
  metres: number;
  seconds: number;
} {
  const bounds = stretchBounds(points, mode, leg);

  const joined = legs.slice(bounds[0], bounds[1] + 1);

  return {
    bounds,
    joined,
    metres: joined.reduce((sum, l) => sum + l.distance, 0),
    seconds: joined.reduce((sum, l) => sum + l.duration, 0),
  };
}

/** A waypoint's number on its marker in route mode: real waypoints counted from 1. */
export function waypointNumber(
  points: readonly MaybeShaping[],
  index: number,
  mode: RoutingMode,
): number {
  let number = 0;

  for (let i = 1; i <= index; i++) {
    if (!isShaping(points, i, mode)) {
      number++;
    }
  }

  return number;
}

type LegGeometry = {
  steps: readonly { geometry: { coordinates: readonly number[][] } }[];
};

/** How far from a shaping point its two legs are compared, in metres. */
const TURN_BACK_REACH = 50;

/** How close the leaving line must keep to the arriving one, in metres. */
const TURN_BACK_TOLERANCE = 5;

/**
 * The shaping points the route leaves the way it came, which a point there to
 * steer it shouldn't do: a misplaced one, or a detour better made a waypoint.
 */
export function turnBacks(
  points: readonly MaybeShaping[],
  mode: RoutingMode,
  legs: readonly LegGeometry[],
): Set<number> {
  const found = new Set<number>();

  if (legs.length !== points.length - 1) {
    return found;
  }

  for (let i = 1; i < points.length - 1; i++) {
    const arriving = legs[i - 1];

    const leaving = legs[i];

    if (
      isShaping(points, i, mode) &&
      arriving &&
      leaving &&
      retraces(legCoords(arriving).toReversed(), legCoords(leaving))
    ) {
      found.add(i);
    }
  }

  return found;
}

function legCoords(leg: LegGeometry): number[][] {
  return leg.steps.flatMap((step) => step.geometry.coordinates as number[][]);
}

/**
 * Whether `leaving` keeps to `back` (the arriving line walked backwards from
 * the same point) over most of their common first {@link TURN_BACK_REACH} m.
 */
function retraces(back: number[][], leaving: number[][]): boolean {
  const origin = back[0] ?? leaving[0];

  if (!origin) {
    return false;
  }

  // Metres east and north of the shaping point; flat at this reach.
  const k = Math.cos(((origin[1] ?? 0) * Math.PI) / 180);

  const project = ([lon = 0, lat = 0]: number[]): [number, number] => [
    (lon - (origin[0] ?? 0)) * k * 111_320,
    (lat - (origin[1] ?? 0)) * 111_320,
  ];

  const backLine = clip(back.map(project), TURN_BACK_REACH * 2);

  const samples = sample(clip(leaving.map(project), TURN_BACK_REACH), 5);

  // Too short a reach to tell a turn from a bend.
  if (samples.length < 4 || length(backLine) < TURN_BACK_REACH / 3) {
    return false;
  }

  const close = samples.filter(
    (p) => distanceToLine(p, backLine) <= TURN_BACK_TOLERANCE,
  ).length;

  return close >= samples.length * 0.8;
}

type Xy = [number, number];

function length(line: Xy[]): number {
  let sum = 0;

  for (let i = 1; i < line.length; i++) {
    sum += Math.hypot(
      line[i]![0] - line[i - 1]![0],
      line[i]![1] - line[i - 1]![1],
    );
  }

  return sum;
}

/** The line's first `reach` metres. */
function clip(line: Xy[], reach: number): Xy[] {
  const out: Xy[] = line.slice(0, 1);

  let left = reach;

  for (let i = 1; i < line.length && left > 0; i++) {
    const [ax, ay] = line[i - 1]!;

    const [bx, by] = line[i]!;

    const d = Math.hypot(bx - ax, by - ay);

    if (d <= left) {
      out.push([bx, by]);
    } else {
      const t = left / d;

      out.push([ax + (bx - ax) * t, ay + (by - ay) * t]);
    }

    left -= d;
  }

  return out;
}

/** Points every `step` metres along the line, past its start. */
function sample(line: Xy[], step: number): Xy[] {
  const out: Xy[] = [];

  let next = step;

  let at = 0;

  for (let i = 1; i < line.length; i++) {
    const [ax, ay] = line[i - 1]!;

    const [bx, by] = line[i]!;

    const d = Math.hypot(bx - ax, by - ay);

    while (d > 0 && next <= at + d) {
      const t = (next - at) / d;

      out.push([ax + (bx - ax) * t, ay + (by - ay) * t]);

      next += step;
    }

    at += d;
  }

  return out;
}

function distanceToLine([px, py]: Xy, line: Xy[]): number {
  let best = Number.POSITIVE_INFINITY;

  for (let i = 1; i < line.length; i++) {
    const [ax, ay] = line[i - 1]!;

    const [bx, by] = line[i]!;

    const dx = bx - ax;

    const dy = by - ay;

    const len2 = dx * dx + dy * dy;

    const t =
      len2 === 0
        ? 0
        : Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len2));

    best = Math.min(best, Math.hypot(px - ax - t * dx, py - ay - t * dy));
  }

  return best;
}
