/**
 * What the elevation chart is showing. Only one profile exists at a time, so
 * this single value answers every question the chart machinery used to answer
 * by inference: whose it is, which of that feature's lines, and — since it is
 * re-resolved from current state rather than snapshotted — what to redraw when
 * that line changes.
 *
 * A tracked device is named by its token. The route planner, the map's features
 * and the GPS recorder chart whatever is currently active — for the features
 * the line `trackViewer.activeTrackIndex` names, which the reducer keeps on its
 * line as features come and go — so they need no key of their own.
 */
export type ElevationChartTarget =
  | { type: 'route-planner' }
  | { type: 'track-viewer' }
  | { type: 'gps-recorder' }
  | { type: 'tracking'; token: string };

export type ElevationChartTargetType = ElevationChartTarget['type'];

/** A target as one comparable string; `''` for none. */
function targetKey(target: ElevationChartTarget | null): string {
  switch (target?.type) {
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
