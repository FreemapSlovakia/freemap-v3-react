import type { RootState } from '@app/store/store.js';
import { buildExportFeatureCollection } from '@features/mapFeaturesExport/model/buildExportFeatureCollection.js';
import { rgbaStringToHexa } from '@shared/colorAlpha.js';
import { COLORS } from '@shared/colors.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import type { Feature, Geometry } from 'geojson';
import { useEffect, useState } from 'react';
import { useStore } from 'react-redux';
import type { LineCoords } from '../model/paint.js';
import type { FeatureSource } from '../model/settingsReducer.js';

/** A shape coloured on the model, in its `#rrggbb` map colour. */
export type ModelShape =
  | { kind: 'fill'; colour: string; rings: LineCoords[] }
  | { kind: 'line'; colour: string; coords: LineCoords }
  | { kind: 'point'; colour: string; coords: number[] };

export interface ModelFeature {
  source: FeatureSource | 'landcover';
  title?: string;
  shapes: ModelShape[];
}

/** A fill or an area outline fainter than this on the map is left off the model. */
const MIN_OPACITY = 0.5;

function hex(colour: unknown): string | undefined {
  if (typeof colour !== 'string' || !colour) {
    return undefined;
  }

  const c = rgbaStringToHexa(colour).slice(0, 7);

  return /^#[0-9a-f]{6}$/.test(c) ? c : undefined;
}

function shapesOf(
  geometry: Geometry | null,
  props: Record<string, unknown>,
): ModelShape[] {
  const stroke = hex(props['stroke']);

  const line = stroke ?? COLORS.normal;

  switch (geometry?.type) {
    case 'Point':
      return [
        {
          kind: 'point',
          colour: hex(props['marker-color']) ?? COLORS.normal,
          coords: geometry.coordinates,
        },
      ];
    case 'MultiPoint':
      return geometry.coordinates.flatMap((coordinates) =>
        shapesOf({ type: 'Point', coordinates }, props),
      );
    case 'LineString':
      return [{ kind: 'line', colour: line, coords: geometry.coordinates }];
    case 'MultiLineString':
      return geometry.coordinates.map((coords) => ({
        kind: 'line',
        colour: line,
        coords,
      }));
    case 'Polygon': {
      const fill = hex(props['fill']);

      const opacity = Number(props['fill-opacity'] ?? 1);

      const filled = fill !== undefined && opacity >= MIN_OPACITY;

      return [
        ...(filled
          ? [
              {
                kind: 'fill' as const,
                colour: fill,
                rings: geometry.coordinates,
              },
            ]
          : []),
        // An outline where the map draws one, or where there is no fill.
        ...((stroke && Number(props['stroke-opacity'] ?? 1) >= MIN_OPACITY) ||
        !filled
          ? geometry.coordinates.map((coords) => ({
              kind: 'line' as const,
              colour: line,
              coords,
            }))
          : []),
      ];
    }
    case 'MultiPolygon':
      return geometry.coordinates.flatMap((coordinates) =>
        shapesOf({ type: 'Polygon', coordinates }, props),
      );
    case 'GeometryCollection':
      return geometry.geometries.flatMap((g) => shapesOf(g, props));
    default:
      return [];
  }
}

function modelFeature(source: FeatureSource, feature: Feature): ModelFeature {
  const props = feature.properties ?? {};

  const title = props['title'];

  return {
    source,
    title: typeof title === 'string' && title ? title : undefined,
    shapes: shapesOf(feature.geometry, props),
  };
}

/**
 * The map features of each chosen source, as the map export collects them,
 * in their map colours. A route coloured per travel mode takes one colour.
 * Collected again as the map changes; `pending` until a collection for the
 * current sources arrives, `features` the last one, `null` before the first.
 */
export function useModelFeatures(sources: FeatureSource[]): {
  features: ModelFeature[] | null;
  pending: boolean;
} {
  const store = useStore<RootState>();

  const has = (source: FeatureSource) => sources.includes(source);

  const drawn =
    has('drawingLines') || has('drawingAreas') || has('drawingPoints');

  // What the chosen sources are collected from; a change collects them again.
  // TODO: their style settings (route, search result colours) aren't watched,
  // though the modal covers the map while they could change; and the whole
  // route-planner slice is, so a change of its UI state collects again too.
  const routePlanner = useAppSelector((s) =>
    has('plannedRoute') ? s.routePlanner : null,
  );

  const mapFeatures = useAppSelector((s) =>
    drawn ? s.trackViewer.trackGeojson : null,
  );

  const tracks = useAppSelector((s) =>
    has('tracking') ? s.tracking.tracks : null,
  );

  const results = useAppSelector((s) =>
    has('search') ? s.search.selectedResults : null,
  );

  const key = sources.join();

  const [collected, setCollected] = useState<{
    key: string;
    value: ModelFeature[];
  } | null>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: the inputs are what `getState` reads
  useEffect(() => {
    let current = true;

    const done = (value: ModelFeature[]) => {
      if (current) {
        setCollected({ key, value });
      }
    };

    Promise.all(
      sources.map(async (source) => {
        const fc = await buildExportFeatureCollection({
          getState: store.getState,
          include: { [source]: true },
          pointMode: { props: true },
          options: {
            route: 'active',
            trackingPoints: false,
            lineColorFallback: COLORS.normal,
          },
        });

        const features = fc.features.map((f) => modelFeature(source, f));

        if (source === 'plannedRoute') {
          // The route's stretches, not the isochrones' rings.
          const stretches = features
            .filter((_, i) => fc.features[i]!.geometry?.type === 'LineString')
            .flatMap(({ shapes }) => shapes);

          for (const shape of stretches) {
            shape.colour = stretches[0]!.colour;
          }
        }

        return features;
      }),
    ).then(
      (value) => done(value.flat().filter(({ shapes }) => shapes.length > 0)),
      // TODO: say so; the model is now built plain without a word.
      () => done([]),
    );

    return () => {
      current = false;
    };
  }, [routePlanner, mapFeatures, tracks, results, key]);

  return {
    features: collected?.value ?? null,
    // Only a change of sources: a live track updating keeps the last collection.
    pending: collected?.key !== key,
  };
}
