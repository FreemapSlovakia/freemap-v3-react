import { transportTypeDefs } from '@shared/transportTypeDefs.js';
import {
  serializeDrawingLine,
  serializeDrawingPoint,
  serializeLatLon,
} from '@shared/urlSerialization.js';
import type { RootState } from '../store/store.js';

export type QueryPart = [string, string | number | boolean];

export function serializeQuery(parts: QueryPart[]): string {
  return parts
    .map(
      (qp) =>
        encodeURIComponent(qp[0]) +
        '=' +
        // FIXME replacing is nonstandard
        encodeURIComponent(qp[1]).replace(/%2F/g, '/'),
    )
    .join('&');
}

export function dateToString(d: Date): string {
  return d.toISOString().replace(/T.*/, '');
}

/**
 * The URL parameters describing what a map holds — the same content a saved map
 * document stores.
 *
 * Kept apart from the rest of the URL (the viewport, layers, the OSM selection,
 * open modals) because the my-maps unsaved-changes comparison digests exactly
 * this. Sharing the serialization is what makes that comparison reliable: a map
 * restored from its URL produces the identical string, so it can't read as
 * changed just because a value took a different but equivalent shape on the way
 * through.
 */
export function getMapContentParts(state: RootState): QueryPart[] {
  const {
    routePlanner,
    trackViewer,
    drawingPoints,
    drawingLines,
    gallery: { filter: galleryFilter },
    tracking,
    objects,
  } = state;

  const parts: QueryPart[] = [];

  if (routePlanner.points.length) {
    parts.push([
      'points',
      (routePlanner.finishOnly ? ',' : '') +
        routePlanner.points
          // A trailing empty point is reachable from a `#points=…,` URL, and
          // this now runs during render via the unsaved-changes comparison.
          .map(
            (point) =>
              (point?.transport ? `${point.transport}/` : '') +
              serializeLatLon(point),
          )
          .join(','),
    ]);

    parts.push(['transport', routePlanner.transportType]);

    if (routePlanner.mode !== 'route') {
      parts.push(['route-mode', routePlanner.mode]);
    }

    if (routePlanner.milestones) {
      parts.push(['milestones', routePlanner.milestones]);
    }

    if (
      transportTypeDefs[routePlanner.transportType].api === 'gh' &&
      routePlanner.mode === 'roundtrip'
    ) {
      parts.push(['trip-distance', routePlanner.roundtripParams.distance]);

      parts.push(['trip-seed', routePlanner.roundtripParams.seed]);
    }

    if (
      transportTypeDefs[routePlanner.transportType].api === 'gh' &&
      routePlanner.mode === 'isochrone'
    ) {
      parts.push(['iso-buckets', routePlanner.isochroneParams.buckets]);

      if (routePlanner.isochroneParams.distanceLimit) {
        parts.push([
          'iso-distance-limit',
          routePlanner.isochroneParams.distanceLimit,
        ]);
      } else {
        parts.push(['iso-time-limit', routePlanner.isochroneParams.timeLimit]);
      }
    }
  }

  if (trackViewer.trackUID) {
    parts.push(['track-uid', trackViewer.trackUID]);
  }

  if (trackViewer.gpxUrl) {
    parts.push(['import-url', trackViewer.gpxUrl]);
  }

  for (const point of drawingPoints.points) {
    parts.push(['point', serializeDrawingPoint(point)]);
  }

  for (const line of drawingLines.lines) {
    parts.push([line.type, serializeDrawingLine(line)]);
  }

  if (galleryFilter.userId) {
    parts.push(['gallery-user-id', galleryFilter.userId]);
  }

  if (galleryFilter.tag != null) {
    parts.push(['gallery-tag', galleryFilter.tag]);
  }

  if (galleryFilter.ratingFrom) {
    parts.push(['gallery-rating-from', galleryFilter.ratingFrom]);
  }

  if (galleryFilter.ratingTo) {
    parts.push(['gallery-rating-to', galleryFilter.ratingTo]);
  }

  if (galleryFilter.takenAtFrom) {
    parts.push([
      'gallery-taken-at-from',
      dateToString(galleryFilter.takenAtFrom),
    ]);
  }

  if (galleryFilter.takenAtTo) {
    parts.push(['gallery-taken-at-to', dateToString(galleryFilter.takenAtTo)]);
  }

  if (galleryFilter.createdAtFrom) {
    parts.push([
      'gallery-created-at-from',
      dateToString(galleryFilter.createdAtFrom),
    ]);
  }

  if (galleryFilter.createdAtTo) {
    parts.push([
      'gallery-created-at-to',
      dateToString(galleryFilter.createdAtTo),
    ]);
  }

  if (galleryFilter.pano !== undefined) {
    parts.push(['gallery-pano', galleryFilter.pano]);
  }

  if (galleryFilter.premium !== undefined) {
    parts.push(['gallery-premium', galleryFilter.premium]);
  }

  for (const license of galleryFilter.license ?? []) {
    parts.push(['gallery-license', license]);
  }

  // Only a restricting subset is serialized; undefined (= both sources) stays
  // out of the URL.
  for (const source of galleryFilter.sources ?? []) {
    parts.push(['gallery-source', source]);
  }

  if (objects.active.length) {
    parts.push(['objects', objects.active.join(';')]);
  }

  for (const {
    token: id,
    label,
    color,
    width,
    fromTime,
    maxCount,
    maxAge,
    splitDistance,
    splitDuration,
  } of tracking.trackedDevices) {
    const deviceParts = [id];

    if (fromTime) {
      deviceParts.push(`f:${fromTime.toISOString()}`);
    }

    if (typeof maxCount === 'number') {
      deviceParts.push(`n:${maxCount}`);
    }

    if (typeof maxAge === 'number') {
      deviceParts.push(`a:${maxAge}`);
    }

    if (typeof width === 'number') {
      deviceParts.push(`w:${width}`);
    }

    if (typeof splitDistance === 'number') {
      deviceParts.push(`sd:${splitDistance}`);
    }

    if (typeof splitDuration === 'number') {
      deviceParts.push(`st:${splitDuration}`);
    }

    if (color) {
      deviceParts.push(`c:${color.replace(/\//g, '_')}`);
    }

    if (label) {
      deviceParts.push(`l:${label.replace(/\//g, '_')}`);
    }

    parts.push(['track', deviceParts.join('/')]);
  }

  return parts;
}
