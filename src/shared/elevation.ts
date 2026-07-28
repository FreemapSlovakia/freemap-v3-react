import { httpRequest } from '@app/httpRequest.js';
import type { RootState } from '@app/store/store.js';
import type { ActionCreatorMatchable } from '@shared/cancelRegister.js';
import { lineSegments } from '@shared/geoutils.js';
import { along } from '@turf/along';
import { distance } from '@turf/distance';
import { getCoord } from '@turf/invariant';
import { length } from '@turf/length';
import type {
  Feature,
  Geometry,
  LineString,
  MultiLineString,
  Position,
} from 'geojson';
import z from 'zod';

const ElevationsSchema = z.array(z.number().nullable());

/**
 * What `?sources=1` adds: the terrain models that answered, as the union over
 * the whole batch. Tokens are a lowercase ISO 3166-1 alpha-2 country code for
 * that country's national model, or the model's own id (`gedtm30`) for one that
 * isn't country-scoped — see `elevationSourcesFromTokens`.
 */
const ElevationsWithSourcesSchema = z.object({
  elevations: ElevationsSchema,
  sources: z.array(z.string()),
});

/**
 * Without `?sources=1` — and from an API too old to know the parameter — the
 * response is the bare elevation array, which reads as "no sources reported" and
 * so is credited to nobody.
 */
const ElevationsResponseCompatSchema = z.preprocess(
  (res) => (Array.isArray(res) ? { elevations: res, sources: [] } : res),
  ElevationsWithSourcesSchema,
);

/**
 * The property the render-only geometry carries its source tokens in, so a
 * cached render line and the credit for its elevation can't drift apart. Only
 * ever stamped on geometry that is never exported.
 */
export const ELEVATION_SOURCES_PROP = 'fm:elevationSources';

/** The tokens a render feature was stamped with, empty when it carries none. */
export function readElevationSources(feature: Feature): string[] {
  const sources = feature.properties?.[ELEVATION_SOURCES_PROP];

  return Array.isArray(sources)
    ? sources.filter((token): token is string => typeof token === 'string')
    : [];
}

/** Stamps `sources` onto a copy of `feature`; a no-op for an empty set. */
export function withElevationSources<G extends Geometry>(
  feature: Feature<G>,
  sources: Set<string>,
): Feature<G> {
  return sources.size === 0
    ? feature
    : {
        ...feature,
        properties: {
          ...feature.properties,
          [ELEVATION_SOURCES_PROP]: [...sources],
        },
      };
}

/**
 * Grid spacing of the finest terrain model the elevation API serves (the 1 m
 * national ALS models); everything else it falls back to is coarser. The floor
 * on how densely a line is worth sampling.
 */
const FINEST_DEM_METERS = 1;

/**
 * Resolves elevation for a batch of `[lat, lon]` pairs via the elevation API.
 * Returns one value (or `null` where the API has no data) per input pair, in
 * the same order. An empty input resolves to an empty array without a request.
 *
 * With the high-resolution terrain model switched off the request is sent
 * unauthenticated, which is what selects the coarse model — the API picks the
 * resolution from the account, so opting out means not presenting it. An
 * anonymous read is answered from SRTM everywhere, not from GEDTM30, which only
 * backs a premium read past the national models' borders. That
 * preference governs what the profile *shows*; pass `bestAvailable` for data
 * the user keeps (an export), which should carry the finest the account can
 * read whatever the display is set to.
 *
 * Pass `sources` to have the models that answered added to that set (the API
 * reports them only when asked, so it stays out of the response — and out of the
 * cache key — for the callers that don't credit anything).
 */
export async function fetchElevations(
  latLons: [number, number][],
  getState: () => RootState,
  cancelActions?: ActionCreatorMatchable[],
  bestAvailable = false,
  sources?: Set<string>,
): Promise<(number | null)[]> {
  if (latLons.length === 0) {
    return [];
  }

  const res = await httpRequest({
    getState,
    method: 'POST',
    url: `/geotools/elevation${sources ? '?sources=1' : ''}`,
    data: latLons,
    expectedStatus: 200,
    cancelActions,
    anonymous: !bestAvailable && !getState().elevationSettings.highResolution,
  });

  const parsed = ElevationsResponseCompatSchema.parse(await res.json());

  for (const token of parsed.sources) {
    sources?.add(token);
  }

  return parsed.elevations;
}

// Deep-clones a line-like geometry's coordinates so callers can write `z` back
// without mutating the input. Preserves the concrete geometry type.
function cloneLineGeometry<G extends LineString | MultiLineString>(
  geometry: G,
): G {
  return geometry.type === 'LineString'
    ? {
        ...geometry,
        coordinates: geometry.coordinates.map((coord) => coord.slice()),
      }
    : {
        ...geometry,
        coordinates: geometry.coordinates.map((segment) =>
          segment.map((coord) => coord.slice()),
        ),
      };
}

/**
 * Returns copies of the given line-like features (`LineString` or multi-segment
 * `MultiLineString`) with elevation filled from the server. `mode: 'missing'`
 * fills only coordinates that lack a `z` ordinate (length < 3); `mode: 'all'`
 * overwrites every `z`. Coordinates the API has no data for are left unchanged.
 * Inputs are never mutated. With `'missing'` and nothing to fill the input
 * array is returned as-is (no request).
 *
 * `sources` collects the models that answered — see {@link fetchElevations}.
 */
export async function enrichElevations<G extends LineString | MultiLineString>(
  features: Feature<G>[],
  mode: 'missing' | 'all',
  getState: () => RootState,
  cancelActions?: ActionCreatorMatchable[],
  sources?: Set<string>,
): Promise<Feature<G>[]> {
  const enriched = features.map((feature) => ({
    ...feature,
    geometry: cloneLineGeometry(feature.geometry),
  }));

  // Direct references into the cloned coordinates so we can write `z` back in
  // input order after the single batched request. A `MultiLineString` flattens
  // its segments here — the geometry boundaries don't matter for a point-wise
  // elevation fill.
  const targets = enriched.flatMap((feature) =>
    lineSegments(feature.geometry)
      .flat()
      .filter((coord) => mode === 'all' || coord.length < 3),
  );

  if (targets.length === 0) {
    return features;
  }

  const eles = await fetchElevations(
    targets.map((coord) => [coord[1]!, coord[0]!]),
    getState,
    cancelActions,
    false,
    sources,
  );

  targets.forEach((coord, i) => {
    const ele = eles[i];

    if (ele != null) {
      coord[2] = ele;
    }
  });

  return enriched;
}

/**
 * Densifies a line-like feature (`LineString` or multi-segment
 * `MultiLineString`) for rendering: every span long enough to draw as a coarse
 * straight line gets intermediate points inserted at roughly screen resolution,
 * each DEM-sampled from the elevation API. Existing vertices keep their
 * elevation; only the inserted points are sampled. A dense line (no span long
 * enough) is a no-op and the same feature reference is returned. Multi-segment
 * tracks densify each segment independently — no points are inserted across the
 * gap between segments.
 *
 * Per-point series (`coordTimes`, `coordinateProperties`) are dropped — they
 * can't be meaningfully interpolated onto inserted points — so this output is
 * for elevation-derived rendering (chart, elevation/steepness colorize,
 * climb/descent stats), not for export.
 *
 * `sources` collects the models that answered — see {@link fetchElevations}.
 */
export async function densifyAlong<G extends LineString | MultiLineString>(
  feature: Feature<G>,
  getState: () => RootState,
  cancelActions?: ActionCreatorMatchable[],
  sources?: Set<string>,
): Promise<Feature<G>> {
  const segments = lineSegments(feature.geometry);

  // ~2 px per sample at the current viewport width, never coarser than 100 m
  // and never finer than the terrain model itself resolves — sampling below
  // that buys no detail, only the model's own quantization drawn as steps, and
  // hundreds of points for a route a few hundred metres long. Derived from the
  // whole track so the sample spacing is uniform regardless of how the
  // recording is split into segments.
  const stepKm = Math.min(
    0.1,
    Math.max(
      FINEST_DEM_METERS / 1000,
      length(feature) / (window.innerWidth / 2),
    ),
  );

  if (!(stepKm > 0)) {
    return feature;
  }

  // Points to insert, tagged with their segment and the vertex they follow, so
  // one batched request fills them all.
  const inserts: { seg: number; after: number; lon: number; lat: number }[] =
    [];

  for (let s = 0; s < segments.length; s++) {
    const coords = segments[s]!;

    if (coords.length < 2) {
      continue;
    }

    const segLine: Feature<LineString> = {
      type: 'Feature',
      properties: {},
      geometry: { type: 'LineString', coordinates: coords },
    };

    let cumKm = 0;

    for (let i = 0; i < coords.length - 1; i++) {
      const segKm = distance(coords[i]!, coords[i + 1]!, {
        units: 'kilometers',
      });

      // Only subdivide spans that would otherwise stretch across several pixels.
      if (segKm > stepKm * 2) {
        const parts = Math.round(segKm / stepKm);

        for (let k = 1; k < parts; k++) {
          const [lon, lat] = getCoord(
            along(segLine, cumKm + (segKm * k) / parts, {
              units: 'kilometers',
            }),
          );

          inserts.push({ seg: s, after: i, lon, lat });
        }
      }

      cumKm += segKm;
    }
  }

  if (inserts.length === 0) {
    return feature;
  }

  const eles = await fetchElevations(
    inserts.map(({ lat, lon }) => [lat, lon]),
    getState,
    cancelActions,
    false,
    sources,
  );

  // `inserts` is ordered by segment then vertex, so one cursor walks it as we
  // rebuild each segment in turn.
  let ins = 0;

  const densified = segments.map((coords, s) => {
    const out: Position[] = [];

    for (let i = 0; i < coords.length; i++) {
      out.push(coords[i]!.slice());

      while (
        ins < inserts.length &&
        inserts[ins]!.seg === s &&
        inserts[ins]!.after === i
      ) {
        const { lon, lat } = inserts[ins]!;

        const ele = eles[ins];

        out.push(ele == null ? [lon, lat] : [lon, lat, ele]);

        ins++;
      }
    }

    return out;
  });

  const properties = { ...(feature.properties ?? {}) };

  delete properties['coordTimes'];

  delete properties['coordinateProperties'];

  const geometry =
    feature.geometry.type === 'LineString'
      ? { type: 'LineString' as const, coordinates: densified[0]! }
      : { type: 'MultiLineString' as const, coordinates: densified };

  return { type: 'Feature', properties, geometry } as Feature<G>;
}
