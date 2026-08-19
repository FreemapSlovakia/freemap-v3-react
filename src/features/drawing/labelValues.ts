import { formatLocationLines } from '@shared/geoutils.js';
import { interpolateLabel } from './interpolateLabel.js';
import type { Line } from './model/actions/drawingLineActions.js';
import type { DrawingPoint } from './model/actions/drawingPointActions.js';

/**
 * What a `{key}` in a label can name: the feature's own properties, plus the
 * values the app works out from its geometry.
 *
 * Resolving a label goes through here and nowhere else. A label is drawn on the
 * map, written into a GeoJSON `title` and a GPX `<name>`, and read by the
 * toposcope — and a key that resolves in one of those and not the others is the
 * failure this exists to prevent: it looks right on screen and comes out as
 * `{location}` in the file.
 */
export type LabelValues = Record<string, string | undefined>;

export function pointLabelValues(
  point: Pick<DrawingPoint, 'coords' | 'props'>,
): LabelValues {
  return {
    ...point.props,
    // Computed rather than stored, so the properties can't shadow it.
    location: formatLocationLines(point.coords),
  };
}

export function lineLabelValues(line: Pick<Line, 'props'>): LabelValues {
  return { ...line.props };
}

/** A drawn point's label as it should read, wherever it is being read. */
export function drawingPointLabel(
  point: Pick<DrawingPoint, 'coords' | 'label' | 'props'>,
): string {
  return interpolateLabel(point.label ?? '', pointLabelValues(point));
}

/** The same for a line or a polygon. */
export function drawingLineLabel(line: Pick<Line, 'label' | 'props'>): string {
  return interpolateLabel(line.label ?? '', lineLabelValues(line));
}
