/**
 * What the elevation chart is showing. Only one profile exists at a time, so
 * this single value answers every question the chart machinery used to answer
 * by inference: whose it is, which of that feature's lines, and — since it is
 * re-resolved from current state rather than snapshotted — what to redraw when
 * that line changes.
 *
 * Each variant names its line by something that survives the feature reordering
 * its own collection: a drawn line by the `id` it was created with (indexes are
 * renumbered by deleting, splitting and joining), a tracked device by its token.
 * The route planner and the track viewer chart whatever is currently active, so
 * they need no key of their own.
 */
export type ElevationChartTarget =
  | { type: 'route-planner' }
  | { type: 'track-viewer' }
  | { type: 'drawing'; lineId: number }
  | { type: 'tracking'; token: string };

export type ElevationChartTargetType = ElevationChartTarget['type'];

/** A target as one comparable string; `''` for none. */
function targetKey(target: ElevationChartTarget | null): string {
  switch (target?.type) {
    case 'drawing':
      return `drawing/${target.lineId}`;

    case 'tracking':
      return `tracking/${target.token}`;

    default:
      return target?.type ?? '';
  }
}

export function targetsEqual(
  a: ElevationChartTarget | null,
  b: ElevationChartTarget | null,
): boolean {
  return targetKey(a) === targetKey(b);
}
