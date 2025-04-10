import { LineString, Position } from 'geojson';
import { Exportable } from '../actions/mainActions.js';
import { mergeLines } from '../geoutils.js';
import { RootState } from '../store.js';

export type GarminCourse = {
  distance?: number;
  elevationGain?: number;
  elevationLoss?: number;
  speedMetersPerSecond?: number;
  elapsedSeconds?: number;
  coordinates: Position[];
};

export function getExportables(): Partial<
  Record<Exportable, (state: RootState) => GarminCourse | string | null>
> {
  return {
    search({ search }: RootState) {
      const geojson = search.selectedResult?.geojson;

      if (!geojson) {
        return null;
      }

      switch (geojson.type) {
        case 'FeatureCollection': {
          const features = structuredClone(geojson.features);

          mergeLines(features);

          const lines = features
            .map((f) => f.geometry)
            .filter((g): g is LineString => g.type === 'LineString');

          return lines.length === 1
            ? { coordinates: lines[0].coordinates }
            : lines.length > 1
              ? 'contains more than single continuous linestring'
              : 'contains no continuous linestring';
        }

        case 'Feature': {
          const { geometry } = geojson;

          return geometry.type === 'LineString'
            ? { coordinates: geometry.coordinates }
            : 'contains no continuous linestring';
        }
      }
    },

    gpx({ trackViewer }: RootState) {
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
          ? 'contains more than single continuous linestring'
          : 'contains no continuous linestring';
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
        return 'Multiple tracks are not supported. Select a single one.';
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
        return 'Multiple lines are not supported. Select a single one.';
      }

      return { coordinates: line.points.map((p) => [p.lon, p.lat]) };
    },
  };
}
