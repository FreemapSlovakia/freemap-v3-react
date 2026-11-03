import { HttpError, httpRequest } from '@app/httpRequest.js';
import type { RootState } from '@app/store/store.js';
import type { CancelTriggers } from '@shared/cancelRegister.js';
import { mergeAttributions } from '@shared/elevation.js';
import { distanceTo } from '@shared/geoutils.js';
import type { AttributionDef } from '@shared/mapDefinitions.js';
import type { LicenseDict } from '@shared/tileLicenses.js';
import type { LatLon } from '@shared/types/common.js';
import z from 'zod';
import { GeoJSONLineStringSchema } from 'zod-geojson';

/** What the terrain service measured for a peak or a saddle node. */
export type TerrainFacts = {
  /**
   * At the summit or saddle point the DTM shows near the node; `null` where it
   * shows none (the node on a slope, or another node's).
   */
  ele: number | null;
  /** Dataset codes, as `/licenses` keys them without `shading:`. */
  eleSources: string[];
  /** Where `ele` was read, where the service moved the point there. */
  at: LatLon | null;
  /** The service's metres from the node to where `ele` was read. */
  distM: number | null;
} & (
  | {
      kind: 'peak';
      prominence: number | null;
      isolationM: number | null;
      /** Behind the prominence, the key col and the isolation together. */
      sources: string[];
      col: {
        ele: number;
        lat: number;
        lon: number;
        name: string | null;
      } | null;
    }
  | {
      kind: 'saddle';
      depthM: number | null;
      keyColOf: { osmId: number; name: string | null } | null;
    }
);

/** Codes as credits; an unknown one is named as it is rather than dropped. */
export function terrainCredits(
  codes: string[],
  licenses: LicenseDict | null,
): AttributionDef[] {
  const credits = codes.flatMap((code): AttributionDef[] => {
    const entries = licenses?.[`shading:${code}`];

    return entries
      ? entries.map(({ title, url }) => ({ type: 'data', name: title, url }))
      : [{ type: 'data', name: code }];
  });

  // Datasets of one model carry the same line (each of Spain's three zones).
  return mergeAttributions(credits);
}

export type TerrainFactsKind = TerrainFacts['kind'];

/** Whether anything is left to show once the missing values are taken out. */
export function hasTerrainValues(facts: TerrainFacts): boolean {
  return facts.kind === 'peak'
    ? facts.prominence !== null ||
        facts.isolationM !== null ||
        facts.col !== null
    : facts.depthM !== null || facts.keyColOf !== null;
}

// Comma-separated on the wire.
const Codes = z
  .string()
  .nullish()
  .transform((s) => (s ? s.split(',') : []));

// The point is the summit or saddle point found, else the node. Missing in an
// older peaks file, which must cost only the point, not the other facts.
const PointSchema = z
  .object({ coordinates: z.tuple([z.number(), z.number()]) })
  .nullish()
  .catch(null);

const NodeProps = {
  ele: z.number().nullable(),
  ele_source: Codes,
  osm_lat: z.number().nullish(),
  osm_lon: z.number().nullish(),
};

/**
 * A terrain-service code naming a country's or a region's model (`sk`, `de_by`,
 * `wls`); a global one (`gedtm30`) or one not known is not taken for national.
 */
const NATIONAL_CODE = /^[a-z]{2,3}(_[a-z0-9]+)?$/;

export function isNational(codes: string[]): boolean {
  return codes.length > 0 && codes.every((code) => NATIONAL_CODE.test(code));
}

/**
 * Where `ele` was read, where there is a point to trust: a `found` one, or a
 * `weak` summit — a weak saddle is the deepest notch around, not the node's.
 */
function nodePoint(
  geometry: z.infer<typeof PointSchema>,
  p: z.infer<z.ZodObject<typeof NodeProps>>,
  trusted: boolean,
  distM: number | null | undefined,
): Pick<TerrainFacts, 'ele' | 'eleSources' | 'at' | 'distM'> {
  const point = geometry && {
    lat: geometry.coordinates[1],
    lon: geometry.coordinates[0],
  };

  // The geometry stays on the node unless found on national data.
  const moved =
    point &&
    p.osm_lat != null &&
    p.osm_lon != null &&
    distanceTo({ lat: p.osm_lat, lon: p.osm_lon }, point) > 0.5;

  return {
    ele: trusted ? p.ele : null,
    eleSources: p.ele_source,
    at: trusted && moved ? point : null,
    // Off GEDTM30 the service doesn't trust the position, so neither do we.
    distM: trusted && isNational(p.ele_source) ? (distM ?? null) : null,
  };
}

const PeakSchema = z.object({
  geometry: PointSchema,
  properties: z.object({
    ...NodeProps,
    summit: z.string().nullish(),
    prom_dist_m: z.number().nullish(),
    prominence: z.number().nullable(),
    isolation_m: z.number().nullable(),
    prominence_sources: Codes,
    isolation_sources: Codes,
    col_ele: z.number().nullable(),
    col_lat: z.number().nullable(),
    col_lon: z.number().nullable(),
    col_name: z.string().nullable(),
  }),
});

const SaddleSchema = z.object({
  geometry: PointSchema,
  properties: z.object({
    ...NodeProps,
    depth_m: z.number().nullable(),
    saddle: z.string(),
    dist_m: z.number().nullish(),
    key_col_of_osm_id: z.number().nullable(),
    key_col_of_name: z.string().nullable(),
  }),
});

const RouteSchema = z.object({ geometry: GeoJSONLineStringSchema });

/** Which lookup a node's tags call for, if any. */
export function terrainFactsKind(
  tags: Record<string, unknown>,
): TerrainFactsKind | null {
  return tags['natural'] === 'peak' || tags['natural'] === 'volcano'
    ? 'peak'
    : tags['natural'] === 'saddle' || tags['mountain_pass'] === 'yes'
      ? 'saddle'
      : null;
}

async function get(
  path: string,
  getState: () => RootState,
  cancel: CancelTriggers,
): Promise<unknown> {
  try {
    const res = await httpRequest({
      ...cancel,
      getState,
      url: `${process.env['TERRAIN_URL']}${path}`,
    });

    return await res.json();
  } catch (err) {
    // A node the service has no record of.
    if (err instanceof HttpError && err.status === 404) {
      return null;
    }

    throw err;
  }
}

/** `null` where the service holds nothing for the node. */
export async function fetchTerrainFacts(
  kind: TerrainFactsKind,
  osmId: number,
  getState: () => RootState,
  cancel: CancelTriggers,
): Promise<TerrainFacts | null> {
  const data = await get(`/${kind}/${osmId}`, getState, cancel);

  if (data === null) {
    return null;
  }

  if (kind === 'peak') {
    const peak = PeakSchema.parse(data);

    const p = peak.properties;

    return {
      kind,
      ...nodePoint(
        peak.geometry,
        p,
        p.summit === 'found' || p.summit === 'weak',
        p.prom_dist_m,
      ),
      prominence: p.prominence,
      isolationM: p.isolation_m,
      sources: [...new Set([...p.prominence_sources, ...p.isolation_sources])],
      // An island's col is the sea, and has no position.
      col:
        p.col_ele !== null && p.col_lat !== null && p.col_lon !== null
          ? {
              ele: p.col_ele,
              lat: p.col_lat,
              lon: p.col_lon,
              name: p.col_name,
            }
          : null,
    };
  }

  const saddle = SaddleSchema.parse(data);

  const s = saddle.properties;

  return {
    kind,
    ...nodePoint(saddle.geometry, s, s.saddle === 'found', s.dist_m),
    // Off a slope or a neighbour's saddle, the depth describes another point.
    depthM: s.saddle === 'found' || s.saddle === 'weak' ? s.depth_m : null,
    keyColOf:
      s.key_col_of_osm_id !== null
        ? { osmId: s.key_col_of_osm_id, name: s.key_col_of_name }
        : null,
  };
}

/**
 * The way over a peak's key col to higher ground. Asked only for a peak with a
 * col, so a 404 is an error here. A major summit's spans ranges, so it is
 * fetched only when it is drawn.
 */
export async function fetchProminenceRoute(
  osmId: number,
  simplifyM: number,
  getState: () => RootState,
  cancel: CancelTriggers,
): Promise<[number, number][]> {
  const res = await httpRequest({
    ...cancel,
    getState,
    url: `${process.env['TERRAIN_URL']}/peak/${osmId}/route?simplify=${simplifyM}`,
  });

  return RouteSchema.parse(await res.json()).geometry.coordinates.map(
    ([lon, lat]): [number, number] => [lat, lon],
  );
}
