import type {
  Line,
  Point,
} from '@features/drawing/model/actions/drawingLineActions.js';
import type {
  DrawingPoint,
  DrawingProps,
} from '@features/drawing/model/actions/drawingPointActions.js';
import type { LatLon } from './types/common.js';

/**
 * How drawing features are written into the URL.
 *
 * Also what the my-maps unsaved-changes comparison digests, so the two can't
 * disagree: anything the URL drops here — a default line cap, a point's id — is
 * dropped from the comparison too, and a map restored from its URL therefore
 * still matches the copy it was saved from.
 */
export function serializeLatLon(point: LatLon | null): string {
  return point ? `${point.lat.toFixed(6)}/${point.lon.toFixed(6)}` : '';
}

/**
 * The data table as one style field: `P` followed by key/value pairs joined by
 * the unit separator, which nests inside the record-separated field list the
 * same way a unit nests inside a record. A key or value carrying either
 * separator can't be typed, and the URL encoder escapes both on the way out.
 *
 * Empty is no field at all, so a feature with no properties adds nothing.
 */
export function serializeDrawingProps(props: DrawingProps | undefined): string {
  const entries = Object.entries(props ?? {});

  return entries.length ? `\x1eP${entries.flat().join('\x1f')}` : '';
}

export function serializeDrawingPoint(point: DrawingPoint): string {
  return `${serializeLatLon(point.coords)}${point.color ? `\x1eC${point.color}` : ''}${
    point.label ? `\x1eL${point.label}` : ''
  }${
    point.markerType === 'square'
      ? '\x1eSs'
      : point.markerType === 'ring'
        ? '\x1eSr'
        : ''
  }${point.icon ? `\x1eI${point.icon}` : ''}${serializeDrawingProps(point.props)}`;
}

/**
 * `holeOf` is passed separately rather than read off the line because the store
 * keys hole membership by the parent's id, and only the caller knows what
 * position that parent takes in the list being written.
 */
export function serializeDrawingLine(line: Line, holeOf?: number): string {
  return `${line.points.map((point: Point) => serializeLatLon(point)).join(',')}${
    line.width ? `\x1eW${line.width}` : ''
  }${line.color ? `\x1eC${line.color}` : ''}${
    line.fillColor ? `\x1eF${line.fillColor}` : ''
  }${line.label ? `\x1eL${line.label}` : ''}${
    // An empty array means no dashes, same as no array at all — writing `D` with
    // no value would read back as unset and so make the round trip lossy.
    line.dashArray?.length ? `\x1eD${line.dashArray}` : ''
  }${
    line.lineCap === 'butt'
      ? '\x1eKb'
      : line.lineCap === 'square'
        ? '\x1eKs'
        : ''
  }${
    line.lineJoin === 'miter'
      ? '\x1eJm'
      : line.lineJoin === 'bevel'
        ? '\x1eJb'
        : ''
  }${holeOf === undefined ? '' : `\x1eH${holeOf}`}${serializeDrawingProps(line.props)}`;
}
