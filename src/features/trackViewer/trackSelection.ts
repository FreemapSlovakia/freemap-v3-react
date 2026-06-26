import type {
  Feature,
  FeatureCollection,
  LineString,
  MultiLineString,
} from 'geojson';

export type TrackLine = Feature<LineString | MultiLineString>;

export function isTrackLine(feature: Feature): feature is TrackLine {
  return (
    feature.geometry.type === 'LineString' ||
    feature.geometry.type === 'MultiLineString'
  );
}

/**
 * The line-like features the elevation chart / "more info" can describe, each
 * with its index in the collection (a multi-segment recording is one entry —
 * its own `MultiLineString` feature).
 */
export function trackLineFeatures(
  fc: FeatureCollection | null | undefined,
): { feature: TrackLine; index: number }[] {
  return (fc?.features ?? []).flatMap((feature, index) =>
    isTrackLine(feature) ? [{ feature, index }] : [],
  );
}

/**
 * The track the chart / info / highlight act on: the explicitly selected one
 * when it's still a valid line, otherwise the first line. `undefined` when the
 * collection holds no line.
 */
export function resolveActiveTrack(
  fc: FeatureCollection | null | undefined,
  selectedIndex: number | null,
): { feature: TrackLine; index: number } | undefined {
  const lines = trackLineFeatures(fc);

  if (selectedIndex != null) {
    const selected = lines.find((line) => line.index === selectedIndex);

    if (selected) {
      return selected;
    }
  }

  return lines[0];
}

/** Standalone points (GPX `<wpt>`) to mark along the elevation profile. */
export function trackWaypoints(
  fc: FeatureCollection | null | undefined,
): { lat: number; lon: number; label?: string }[] {
  return (fc?.features ?? []).flatMap((feature) => {
    if (feature.geometry.type !== 'Point') {
      return [];
    }

    const [lon, lat] = feature.geometry.coordinates;

    const name = feature.properties?.['name'];

    return [
      {
        lat: lat!,
        lon: lon!,
        label: typeof name === 'string' ? name : undefined,
      },
    ];
  });
}
