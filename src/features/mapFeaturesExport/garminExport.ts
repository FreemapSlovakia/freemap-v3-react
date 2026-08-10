import type { RootState } from '@app/store/store.js';
import { hasGeometry } from '@features/search/model/resultUtils.js';
import { mergeLines } from '@shared/geoutils.js';
import type { LineString, Position } from 'geojson';
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

      const features = structuredClone(
        shown.flatMap(({ geojson }) =>
          geojson.type === 'FeatureCollection' ? geojson.features : [geojson],
        ),
      );

      mergeLines(features);

      const lines = features
        .map((f) => f.geometry)
        .filter((g): g is LineString => g.type === 'LineString');

      return lines.length === 1
        ? { coordinates: lines[0].coordinates }
        : lines.length > 1
          ? 'garmin.multipleLineStrings'
          : 'garmin.noLineString';
    },

    import({ trackViewer }: RootState) {
      if (!trackViewer.trackGeojson) {
        return null;
      }

      const features = structuredClone(trackViewer.trackGeojson.features);

      mergeLines(features);

      const lines = features
        .map((f) => f.geometry)
        .filter((g): g is LineString => g.type === 'LineString');

      return lines.length === 1
        ? { coordinates: lines[0].coordinates }
        : lines.length > 1
          ? 'garmin.multipleLineStrings'
          : 'garmin.noLineString';
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
