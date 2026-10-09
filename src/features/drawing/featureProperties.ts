import type {
  BatchCounts,
  BatchKind,
  BatchPatch,
} from '@shared/batchProperties.js';
import { COLORS } from '@shared/colors.js';
import type { FeatureProperties } from '@shared/components/FeaturePropertiesModal.js';
import type {
  LineChange,
  PointChange,
} from './model/actions/drawingBatchActions.js';
import type {
  DrawnLine,
  drawingLineChangeProperties,
} from './model/actions/drawingLineActions.js';
import type {
  DrawingPoint,
  drawingPointChangeProperties,
} from './model/actions/drawingPointActions.js';

/** A drawn point as the properties editor shows it. */
export function pointProperties(point: DrawingPoint): FeatureProperties {
  return {
    label: point.label ?? '',
    props: point.props,
    color: point.color ?? COLORS.normal,
    markerType: point.markerType ?? 'pin',
    icon: point.icon ?? '',
    type: 'line',
    fillColor: undefined,
    width: undefined,
    dashArray: [],
    lineCap: 'round',
    lineJoin: 'round',
  };
}

/** A drawn line or polygon as the properties editor shows it. */
export function lineProperties(line: DrawnLine): FeatureProperties {
  const color = line.color ?? COLORS.normal;

  return {
    label: line.label ?? '',
    props: line.props,
    color,
    markerType: 'pin',
    icon: '',
    type: line.type,
    // Unset follows the stroke, and the picker shows it so; saved as such.
    fillColor: line.fillColor,
    width: line.width,
    dashArray: line.dashArray ?? [],
    lineCap: line.lineCap ?? 'round',
    lineJoin: line.lineJoin ?? 'round',
  };
}

export function pointChange(
  index: number,
  values: FeatureProperties,
): ReturnType<typeof drawingPointChangeProperties>['payload'] {
  return {
    index,
    properties: {
      label: values.label || undefined,
      color: values.color,
      markerType: values.markerType,
      icon: values.icon || undefined,
      props: values.props,
    },
  };
}

export function lineChange(
  index: number,
  values: FeatureProperties,
): ReturnType<typeof drawingLineChangeProperties>['payload'] {
  return {
    index,
    properties: {
      label: values.label || undefined,
      color: values.color,
      fillColor: values.fillColor,
      width: values.width,
      type: values.type,
      dashArray: values.dashArray,
      lineCap: values.lineCap,
      lineJoin: values.lineJoin,
      props: values.props,
    },
  };
}

/** A batch patch as a drawn feature's change: an emptied label or icon is none. */
export function drawingPatch({
  label,
  icon,
  ...rest
}: BatchPatch): PointChange & LineChange {
  return {
    ...rest,
    ...(label !== undefined && { label: label || undefined }),
    ...(icon !== undefined && { icon: icon || undefined }),
  };
}

/** Which kind of batch edit takes a line; none for a hole, which goes with its polygon. */
function batchKindOf(line: DrawnLine): 'lines' | 'polygons' | undefined {
  return line.holeOfId !== undefined
    ? undefined
    : line.type === 'polygon'
      ? 'polygons'
      : 'lines';
}

/** Which points and lines a batch edit of `kind` takes. */
export function drawingBatchIndexes(
  points: readonly DrawingPoint[],
  lines: readonly DrawnLine[],
  kind: BatchKind,
): { points: number[]; lines: number[] } {
  return {
    points: kind === 'all' || kind === 'points' ? points.map((_, i) => i) : [],
    lines: lines.flatMap((line, i) => {
      const of = batchKindOf(line);

      return of && (kind === 'all' || kind === of) ? [i] : [];
    }),
  };
}

export function drawingBatchCounts(
  points: readonly DrawingPoint[],
  lines: readonly DrawnLine[],
): BatchCounts {
  const counts = { points: points.length, lines: 0, polygons: 0 };

  for (const line of lines) {
    const of = batchKindOf(line);

    if (of) {
      counts[of]++;
    }
  }

  return counts;
}
