import type { RootState } from '@app/store/store.js';
import { hasGeometry } from '@features/search/model/resultUtils.js';
import { stitchLines } from '@shared/geoutils.js';
import { flatten as turfFlatten } from '@turf/flatten';
import type { Feature, LineString, Position } from 'geojson';
import type { Exportable } from './model/actions.js';

export type GarminCourse = {
  distance?: number;
  elevationGain?: number;
  elevationLoss?: number;
  speedMetersPerSecond?: number;
  elapsedSeconds?: number;
  coordinates: Position[];
};

/** Message-key paths into `MapFeaturesExportMessages` for export failures. */
export type GarminExportError =
  | 'garmin.multipleLineStrings'
  | 'garmin.noLineString'
  | 'garmin.multipleTracks'
  | 'garmin.multipleLines';

/**
 * Weak, so nothing is held once the store drops what it was keyed on. The value
 * is shared between calls, so a consumer must treat the course — `coordinates`
 * included — as read-only.
 */
const courses = new WeakMap<object, GarminCourse | GarminExportError>();

/**
 * One continuous line is a course; anything else is a refusal.
 *
 * A closed line counts, which is why these paths stitch rather than merge: a
 * ride that ends where it started is still a ride. It also means a closed way
 * with no area semantics — a roundabout, a loop path — counts as a second line
 * beside a route, and two lines are refused. Deliberate: silently exporting one
 * of the two, which is what dropping it as a polygon used to do, is worse than
 * saying so.
 */
function toCourse(
  features: Feature[],
): GarminCourse | 'garmin.multipleLineStrings' | 'garmin.noLineString' {
  const lines = features
    .map((f) => f.geometry)
    .filter((g): g is LineString => g.type === 'LineString');

  return lines.length === 1
    ? { coordinates: lines[0].coordinates }
    : lines.length > 1
      ? 'garmin.multipleLineStrings'
      : 'garmin.noLineString';
}

export function getExportables(): Partial<
  Record<
    Exportable,
    (state: RootState) => GarminCourse | GarminExportError | null
  >
> {
  return {
    // A course is a single line, so the results shown are pooled and the one
    // line among them is the course — anything else is a refusal.
    search({ search }: RootState) {
      const shown = search.selectedResults.filter(hasGeometry);

      if (shown.length === 0) {
        return null;
      }

      // Kept per `selectedResults`, which Redux only replaces when the results
      // themselves change. The export modal evaluates every exportable in an
      // effect keyed on the whole store, so without this a pinned long-distance
      // route relation — 2000 parts, ~50 000 positions — restitches on every
      // action that touches any slice, half a second at a time.
      const cached = courses.get(search.selectedResults);

      if (cached !== undefined) {
        return cached;
      }

      // Flattened first: an OSM relation arrives as one `MultiLineString`, and
      // stitching only joins `LineString`s — whole, its parts would join into
      // nothing and the course would read as having no line.
      const features = structuredClone(
        shown.flatMap(({ geojson }) =>
          turfFlatten(geojson).features.map((feature) => feature as Feature),
        ),
      );

      stitchLines(features);

      const course = toCourse(features);

      courses.set(search.selectedResults, course);

      return course;
    },

    import({ trackViewer }: RootState) {
      const { trackGeojson } = trackViewer;

      if (!trackGeojson) {
        return null;
      }

      const cached = courses.get(trackGeojson);

      if (cached !== undefined) {
        return cached;
      }

      // Flattened and stitched for the same two reasons as `search` above. A
      // `<trk>` of several `<trkseg>` — any paused and resumed recording —
      // arrives as one `MultiLineString`, which stitching alone would leave
      // untouched.
      const features = structuredClone(
        trackGeojson.features.flatMap((feature) =>
          turfFlatten(feature).features.map((part) => part as Feature),
        ),
      );

      stitchLines(features);

      const course = toCourse(features);

      courses.set(trackGeojson, course);

      return course;
    },

    tracking({ tracking, main: { selection } }: RootState) {
      const tracks = tracking.tracks.filter((t) => t.trackPoints.length > 0);

      if (tracks.length === 0) {
        return null;
      }

      let track;

      if (selection?.type === 'tracking') {
        const { id } = selection;

        track =
          typeof id === 'number'
            ? tracking.tracks[id]
            : tracking.tracks.find((t) => t.token === id);

        if (track && !tracks.includes(track)) {
          track = undefined;
        }
      }

      if (track) {
        // nothing
      } else if (tracking.tracks.length === 1) {
        track = tracking.tracks[0];
      } else {
        return 'garmin.multipleTracks';
      }

      return { coordinates: track.trackPoints.map((tp) => [tp.lon, tp.lat]) };
    },

    plannedRoute({ routePlanner }: RootState) {
      const alternative =
        routePlanner.alternatives[routePlanner.activeAlternativeIndex];

      if (!alternative) {
        return null;
      }

      const coordinates = alternative.legs.flatMap((leg) =>
        leg.steps.flatMap((step) => step.geometry.coordinates),
      );

      return {
        coordinates,
        distance: alternative.distance,
        elapsedSeconds: alternative.duration,
      };
    },

    drawingLines({ drawingLines, main: { selection } }: RootState) {
      const lines = drawingLines.lines.filter((line) => line.type === 'line');

      if (lines.length === 0) {
        return null;
      }

      let line;

      if (selection?.type === 'draw-line-poly') {
        const { id } = selection;

        line = drawingLines.lines[id];

        if (!lines.includes(line)) {
          line = undefined;
        }
      }

      if (line) {
        // nothing
      } else if (lines.length === 1) {
        line = lines[0];
      } else {
        return 'garmin.multipleLines';
      }

      return { coordinates: line.points.map((p) => [p.lon, p.lat]) };
    },
  };
}
