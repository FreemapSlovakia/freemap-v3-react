import { urlWire } from '@features/dataViewer/model/urlForm.js';
import {
  GALLERY_SOURCES,
  type GallerySource,
} from '@features/gallery/galleryUtils.js';
import {
  type GalleryLicense,
  GalleryLicenseSchema,
} from '@features/gallery/licenses.js';
import type { GalleryFilter } from '@features/gallery/model/actions.js';
import { activeGalleryFilterSelector } from '@features/gallery/model/selectors.js';
import { transportTypeDefs } from '@shared/transportTypeDefs.js';
import {
  featureIdsEqual,
  type OsmFeatureId,
  osmElementTypes,
} from '@shared/types/featureId.js';
import { serializeLatLon } from '@shared/urlSerialization.js';
import type { RootState } from '../store/store.js';

export type QueryPart = [string, string | number | boolean];

export function serializeQuery(parts: QueryPart[]): string {
  return parts
    .map(
      (qp) =>
        encodeURIComponent(qp[0]) +
        '=' +
        // FIXME replacing is nonstandard
        encodeURIComponent(qp[1]).replaceAll('%2F', '/'),
    )
    .join('&');
}

/**
 * Adds a date part, or nothing at all when the date isn't one.
 *
 * `toISOString()` throws on an Invalid Date. The URL parser keeps those out of
 * the store, but a saved map document or a persisted filter can hold one too,
 * and this runs during render through the unsaved-changes comparison — where a
 * throw is a blank screen rather than a logged error. Dropping the part rather
 * than writing it empty also keeps a bad date reading the same as no date, so
 * it can't show up as an unsaved change.
 */
function pushDate(parts: QueryPart[], key: string, d: Date | undefined): void {
  if (d && isValidDate(d)) {
    parts.push([key, d.toISOString().replace(/T.*/, '')]);
  }
}

export function isValidDate(d: Date): boolean {
  return !Number.isNaN(d.getTime());
}

/** The photo filter's URL parameters; none for an empty filter. */
export function galleryFilterParts(filter: GalleryFilter): QueryPart[] {
  const parts: QueryPart[] = [];

  if (filter.userId) {
    parts.push(['gallery-user-id', filter.userId]);
  }

  if (filter.tag != null) {
    parts.push(['gallery-tag', filter.tag]);
  }

  if (filter.ratingFrom) {
    parts.push(['gallery-rating-from', filter.ratingFrom]);
  }

  if (filter.ratingTo) {
    parts.push(['gallery-rating-to', filter.ratingTo]);
  }

  pushDate(parts, 'gallery-taken-at-from', filter.takenAtFrom);

  pushDate(parts, 'gallery-taken-at-to', filter.takenAtTo);

  pushDate(parts, 'gallery-created-at-from', filter.createdAtFrom);

  pushDate(parts, 'gallery-created-at-to', filter.createdAtTo);

  if (filter.pano !== undefined) {
    parts.push(['gallery-pano', filter.pano]);
  }

  if (filter.premium !== undefined) {
    parts.push(['gallery-premium', filter.premium]);
  }

  for (const license of filter.license ?? []) {
    parts.push(['gallery-license', license]);
  }

  // Only a restricting subset; all of them, like undefined, means no
  // restriction and reads back as such.
  if (filter.sources && filter.sources.length < GALLERY_SOURCES.length) {
    for (const source of filter.sources) {
      parts.push(['gallery-source', source]);
    }
  }

  return parts;
}

/** A query string as its params, a repeated one as a list. */
export function parseQuery(search: string): Record<string, string | string[]> {
  const q: Record<string, string | string[]> = {};

  for (const [k, v] of new URLSearchParams(search)) {
    const e = q[k];

    if (Array.isArray(e)) {
      e.push(v);
    } else if (e === undefined) {
      q[k] = v;
    } else {
      q[k] = [e, v];
    }
  }

  return q;
}

/** The photo filter `galleryFilterParts` wrote; invalid values are left out. */
export function galleryFilterFromQuery(
  query: Record<string, string | string[] | undefined>,
): GalleryFilter {
  const one = (key: string) => {
    const v = query[key];

    return typeof v === 'string' ? v : undefined;
  };

  const all = (key: string) => {
    const v = query[key];

    return v === undefined ? [] : Array.isArray(v) ? v : [v];
  };

  const num = (key: string) => {
    const n = Number.parseFloat(one(key) ?? '');

    return n || undefined;
  };

  const date = (key: string) => {
    const d = new Date(one(key) ?? '');

    return isValidDate(d) ? d : undefined;
  };

  const flag = (key: string) => {
    const v = one(key);

    return v === undefined ? undefined : v === 'true';
  };

  const license = all('gallery-license').filter(
    (x): x is GalleryLicense => GalleryLicenseSchema.safeParse(x).success,
  );

  const sources = all('gallery-source').filter((x): x is GallerySource =>
    (GALLERY_SOURCES as string[]).includes(x),
  );

  const filter: GalleryFilter = {
    userId: num('gallery-user-id'),
    tag: one('gallery-tag'),
    ratingFrom: num('gallery-rating-from'),
    ratingTo: num('gallery-rating-to'),
    takenAtFrom: date('gallery-taken-at-from'),
    takenAtTo: date('gallery-taken-at-to'),
    createdAtFrom: date('gallery-created-at-from'),
    createdAtTo: date('gallery-created-at-to'),
    pano: flag('gallery-pano'),
    premium: flag('gallery-premium'),
    license: license.length ? license : undefined,
    sources:
      sources.length && sources.length < GALLERY_SOURCES.length
        ? sources
        : undefined,
  };

  return Object.fromEntries(
    Object.entries(filter).filter(([, v]) => v !== undefined),
  ) as GalleryFilter;
}

export const sameGalleryFilter = (a: GalleryFilter, b: GalleryFilter) =>
  serializeQuery(galleryFilterParts(a)) ===
  serializeQuery(galleryFilterParts(b));

/** Whether it restricts nothing: no URL params. */
export const isGalleryFilterEmpty = (f: GalleryFilter) =>
  galleryFilterParts(f).length === 0;

/**
 * A saved map's photo filter, or undefined for none: saved with the layer off
 * it is empty, as older maps' always-stored one mostly is.
 */
export const mapGalleryFilter = ({
  galleryFilter,
}: {
  galleryFilter?: GalleryFilter;
}): GalleryFilter | undefined =>
  galleryFilter && !isGalleryFilterEmpty(galleryFilter)
    ? galleryFilter
    : undefined;

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
  const { routePlanner, trackViewer, tracking, objects, search } = state;

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

      if (routePlanner.isochroneParams.reverseFlow) {
        parts.push(['iso-reverse', 1]);
      }
    }
  }

  // Only while the link can carry every feature; otherwise a snapshot does
  // (`localTrack`). `track-uid=` / `import-url=` are read, never written.
  parts.push(...(urlWire(trackViewer.trackGeojson) ?? []));

  // None while the layer is off: the filter is then only remembered.
  parts.push(...galleryFilterParts(activeGalleryFilterSelector(state)));

  if (objects.active.length) {
    parts.push(['objects', objects.active.join(';')]);
  }

  // One param per kept result — the map holds any number of them. The previewed
  // one is left out: it lasts only as long as it is being looked at, so a URL
  // naming it would promise something a reload can't keep. Only OSM elements can
  // be named at all; a WMS or a plain-coordinates result has no id to read back,
  // so the URL says nothing of it and neither does the digest — the map document
  // is the only thing that carries it. Negative ids belong to elements that
  // exist in an editor and nowhere else.
  //
  // A result whose fetch is still in flight counts exactly as the loaded one it
  // becomes: a restore starts those fetches before the map is even read, so a
  // digest that waited for them would never match the one the map was saved
  // with, and every reload would take the has-unsaved-changes path.
  //
  // Written in a fixed order rather than the one the map happens to hold them
  // in, because a restore reads them back grouped by element type — so a map
  // pinned way-then-node would come back node-then-way and read as changed
  // forever.
  const osmPins = search.selectedResults
    .map(({ id }) => id)
    .filter(
      (id): id is OsmFeatureId =>
        id.type === 'osm' &&
        id.id > 0 &&
        !(search.previewId && featureIdsEqual(search.previewId, id)),
    )
    .sort(
      (a, b) =>
        osmElementTypes.indexOf(a.elementType) -
          osmElementTypes.indexOf(b.elementType) || a.id - b.id,
    );

  for (const id of osmPins) {
    parts.push([`osm-${id.elementType}`, id.id]);
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

    if (fromTime && isValidDate(fromTime)) {
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
      deviceParts.push(`c:${color.replaceAll('/', '_')}`);
    }

    if (label) {
      deviceParts.push(`l:${label.replaceAll('/', '_')}`);
    }

    parts.push(['track', deviceParts.join('/')]);
  }

  return parts;
}
