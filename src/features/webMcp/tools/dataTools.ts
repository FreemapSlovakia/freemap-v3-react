import type { RootState } from '@app/store/store.js';
import {
  type Exportable,
  ExportTypeSchema,
  exportMapFeatures,
} from '@features/mapFeaturesExport/model/actions.js';
import { fetchElevations } from '@shared/elevation.js';
import { elevationStats } from '@shared/geoutils.js';
import type { LineString, Position } from 'geojson';
import z from 'zod';
import { defineTool } from '../tool.js';

const MAX_ELEVATION_POINTS = 100;

/** Beyond this the answer is worth downloading rather than reading. */
const MAX_GEOJSON_CHARS = 100_000;

const EXPORTABLES: Exportable[] = [
  'plannedRoute',
  'objects',
  'pictures',
  'drawingLines',
  'drawingAreas',
  'drawingPoints',
  'tracking',
  'import',
  'search',
];

/**
 * The planned route as one line: the elevation-filled render copy where
 * `ensureRouteRenderGeojson` has built one, else the router's own coordinates.
 */
function plannedRouteLine(state: RootState): LineString | null {
  const {
    renderGeojson,
    sampledGeojson,
    alternatives,
    activeAlternativeIndex,
  } = state.routePlanner;

  const line = renderGeojson ?? sampledGeojson?.line;

  if (line) {
    return line.geometry;
  }

  const alternative = alternatives[activeAlternativeIndex];

  if (!alternative) {
    return null;
  }

  const coordinates: Position[] = alternative.legs.flatMap((leg) =>
    leg.steps.flatMap((step) => step.geometry.coordinates as Position[]),
  );

  return coordinates.length ? { type: 'LineString', coordinates } : null;
}

export const dataTools = [
  defineTool({
    name: 'get-elevation',
    description:
      'Reads the height above sea level of the given points from the terrain model, in metres. A point the model has no data for comes back as null.',
    input: z.object({
      points: z
        .array(
          z.object({
            lat: z.number().min(-90).max(90),
            lon: z.number().min(-180).max(180),
          }),
        )
        .min(1)
        .max(MAX_ELEVATION_POINTS),
    }),
    async execute({ points }, { store }) {
      const elevations = await fetchElevations(
        points.map(({ lat, lon }) => [lat, lon]),
        store.getState,
      );

      return points.map((point, i) => ({ ...point, ele: elevations[i] }));
    },
  }),

  defineTool({
    name: 'get-route-elevation',
    description:
      'Climb, drop and the highest and lowest point of the route currently planned, in metres.',
    input: z.object({}),
    async execute(_args, { store }) {
      // The render copy is a lazy cache only the chart and colorize build, so
      // right after plan-route there is none — and an OSRM route carries no
      // elevation of its own to fall back on.
      const { ensureRouteRenderGeojson } = await import(
        /* webpackChunkName: "ensure-route-render-geojson" */
        '@features/routePlanner/model/ensureRouteRenderGeojson.js'
      );

      await ensureRouteRenderGeojson(store.getState, store.dispatch);

      const line = plannedRouteLine(store.getState());

      if (!line) {
        throw new Error('No route is planned. Call plan-route first.');
      }

      const stats = elevationStats(line);

      if (stats.minEle !== null) {
        return stats;
      }

      // Nothing was measured: either the line carries no elevation at all, or
      // it is shorter than the step `elevationStats` counts over.
      const eles = line.coordinates
        .map((coord) => coord[2])
        .filter((ele): ele is number => typeof ele === 'number');

      if (eles.length === 0) {
        throw new Error('The planned route carries no elevation.');
      }

      return {
        minEle: Math.min(...eles),
        maxEle: Math.max(...eles),
        ascent: 0,
        descent: 0,
      };
    },
  }),

  defineTool({
    name: 'get-map-features',
    description:
      'Returns everything the user has on the map — drawings, the planned route, searched places, shown objects, imported tracks — as one GeoJSON FeatureCollection.',
    input: z.object({}),
    async execute(_args, { store }) {
      const { buildExportFeatureCollection } = await import(
        /* webpackChunkName: "build-export-feature-collection" */
        '@features/mapFeaturesExport/model/buildExportFeatureCollection.js'
      );

      const collection = await buildExportFeatureCollection({
        getState: store.getState,
        include: Object.fromEntries(EXPORTABLES.map((name) => [name, true])),
        pointMode: { props: true },
      });

      const json = JSON.stringify(collection);

      if (json.length > MAX_GEOJSON_CHARS) {
        throw new Error(
          `The map holds ${collection.features.length} features, too much to return. Use download-map-features instead.`,
        );
      }

      return json;
    },
  }),

  defineTool({
    name: 'download-map-features',
    description:
      "Saves what is on the map to a file in the user's downloads, as GPX, GeoJSON or KML.",
    input: z.object({
      format: ExportTypeSchema,
      elevation: z
        .enum(['none', 'missing', 'all'])
        .optional()
        .describe(
          'Fill elevation from the terrain model into what is written; `missing` only where there is none.',
        ),
      name: z.string().optional(),
    }),
    execute({ format, elevation, name }, { store }) {
      store.dispatch(
        exportMapFeatures({
          exportables: EXPORTABLES,
          type: format,
          target: 'download',
          elevation,
          name,
        }),
      );
    },
  }),
];
