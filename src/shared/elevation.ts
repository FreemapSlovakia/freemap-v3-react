import { httpRequest } from '@app/httpRequest.js';
import type { RootState } from '@app/store/store.js';
import type {
  ActionCreatorMatchable,
  CancelTriggers,
} from '@shared/cancelRegister.js';
import { lineSegments, withoutPerPointData } from '@shared/geoutils.js';
import type { AttributionDef } from '@shared/mapDefinitions.js';
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

/**
 * What invalidates an elevation read: the actions that cancel it, or the full
 * trigger set where "no longer wanted" isn't a list of actions — a subject that
 * can be re-announced unchanged needs a state comparison instead, or the read
 * dies to an action that starts nothing in its place.
 */
export type ElevationCancel = ActionCreatorMatchable[] | CancelTriggers;

function cancelTriggers(cancel?: ElevationCancel): CancelTriggers {
  return Array.isArray(cancel) ? { cancelActions: cancel } : (cancel ?? {});
}

const ElevationsSchema = z.array(z.number().nullable());

/**
 * One credit the API asks to display, as the app's own attribution entry. The
 * name is rendered as a link, and a credit can also come back off a shared map's
 * geometry, so only an `http(s)` URL is kept — anything else is named without
 * one rather than dropped, under-crediting being the worse failure.
 */
const AttributionSchema = z
  .object({ name: z.string(), url: z.unknown().optional() })
  .transform(
    ({ name, url }): AttributionDef =>
      typeof url === 'string' && /^https?:\/\//i.test(url)
        ? { type: 'data', name, url }
        : { type: 'data', name },
  );

/**
 * A whole credit list, from the API or off a stamp. Both arrive from outside, so
 * a malformed entry is dropped on its own and a malformed list credits nobody —
 * neither may take an elevation read down with it.
 */
const AttributionListSchema = z
  .array(z.unknown())
  .catch([])
  .transform((entries) =>
    entries.flatMap((entry) => {
      const parsed = AttributionSchema.safeParse(entry);

      return parsed.success ? [parsed.data] : [];
    }),
  );

/**
 * What `?sources=1` adds. `sources` are the models that answered, as the union
 * over the whole batch: a lowercase ISO 3166-1 alpha-2 country code for that
 * country's national model, or the model's own id (`gedtm30`) for one that
 * isn't country-scoped. `attributions` are the credits for them, resolved by
 * the server so a new dataset needs no release here.
 *
 * The two are not index-aligned — one model can carry several credits or none —
 * so never zip them. `attributions` is absent from an API that predates it, and
 * reads as no credit at all.
 */
const ElevationsWithSourcesSchema = z.object({
  elevations: ElevationsSchema,
  sources: z.array(z.string()),
  attributions: AttributionListSchema,
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
 * What a read was answered by, accumulated across however many requests the
 * caller pours in: the model tokens, which decide the readout's precision, and
 * the credits to display. The attributions are keyed by their content, so one
 * repeated across batched reads is listed once.
 */
export type ElevationCredits = {
  sources: Set<string>;
  attributions: Map<string, AttributionDef>;
};

export function newElevationCredits(): ElevationCredits {
  return { sources: new Set(), attributions: new Map() };
}

/** The collected credits, in the order they were first reported. */
export function creditedAttributions(
  credits: ElevationCredits,
): AttributionDef[] {
  return [...credits.attributions.values()];
}

function attributionKey(attr: AttributionDef): string {
  return `${attr.name}\u0000${attr.url ?? ''}`;
}

/** Concatenates credit lists, keeping first-seen order and dropping repeats. */
export function mergeAttributions(
  ...lists: AttributionDef[][]
): AttributionDef[] {
  const byKey = new Map<string, AttributionDef>();

  for (const list of lists) {
    for (const attr of list) {
      byKey.set(attributionKey(attr), attr);
    }
  }

  return [...byKey.values()];
}

/**
 * The property the render-only geometry carries its credits in, so a cached
 * render line and the credit for its elevation can't drift apart. Only ever
 * stamped on geometry that is never exported.
 */
export const ELEVATION_ATTRIBUTIONS_PROP = 'fm:elevationAttributions';

/** The credits a render feature was stamped with, empty when it carries none. */
export function readElevationAttributions(feature: Feature): AttributionDef[] {
  return AttributionListSchema.parse(
    feature.properties?.[ELEVATION_ATTRIBUTIONS_PROP],
  );
}

/** Stamps `attributions` onto a copy of `feature`; a no-op for an empty list. */
export function withElevationAttributions<G extends Geometry>(
  feature: Feature<G>,
  attributions: AttributionDef[],
): Feature<G> {
  return attributions.length === 0
    ? feature
    : {
        ...feature,
        properties: {
          ...feature.properties,
          [ELEVATION_ATTRIBUTIONS_PROP]: attributions,
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
 * The API picks the model from the account the read presents: the national
 * high-resolution ones where they exist and GEDTM30 past their borders for
 * premium, SRTM everywhere otherwise. Nothing here chooses — every read asks for
 * the finest the account can get.
 *
 * Pass `credits` to have what answered collected into it (the API reports that
 * only when asked, so it stays out of the response — and out of the cache key —
 * for the callers that don't credit anything).
 */
export async function fetchElevations(
  latLons: [number, number][],
  getState: () => RootState,
  cancel?: ElevationCancel,
  credits?: ElevationCredits,
): Promise<(number | null)[]> {
  if (latLons.length === 0) {
    return [];
  }

  const res = await httpRequest({
    getState,
    method: 'POST',
    url: `/geotools/elevation${credits ? '?sources=1' : ''}`,
    data: latLons,
    expectedStatus: 200,
    ...cancelTriggers(cancel),
  });

  const parsed = ElevationsResponseCompatSchema.parse(await res.json());

  for (const token of parsed.sources) {
    credits?.sources.add(token);
  }

  for (const attr of parsed.attributions) {
    credits?.attributions.set(attributionKey(attr), attr);
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
 * `credits` collects what answered — see {@link fetchElevations}.
 */
export async function enrichElevations<G extends LineString | MultiLineString>(
  features: Feature<G>[],
  mode: 'missing' | 'all',
  getState: () => RootState,
  cancel?: ElevationCancel,
  credits?: ElevationCredits,
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
    cancel,
    credits,
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
 * `credits` collects what answered — see {@link fetchElevations}.
 */
export async function densifyAlong<G extends LineString | MultiLineString>(
  feature: Feature<G>,
  getState: () => RootState,
  cancel?: ElevationCancel,
  credits?: ElevationCredits,
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
    cancel,
    credits,
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

  const properties = withoutPerPointData(feature.properties);

  const geometry =
    feature.geometry.type === 'LineString'
      ? { type: 'LineString' as const, coordinates: densified[0]! }
      : { type: 'MultiLineString' as const, coordinates: densified };

  return { type: 'Feature', properties, geometry } as Feature<G>;
}
