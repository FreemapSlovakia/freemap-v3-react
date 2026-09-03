import pg from 'pg';

/**
 * Read-only access to the `osm_object` table behind osm.freemap.sk
 * (freemap-osm-api). Queried directly rather than through `/v1/features`, which
 * caps a response at 2000 features where a country runs to hundreds of thousands.
 *
 * Connects through the standard libpq environment variables; the defaults are
 * an fm5 run as the `freemap` user, which peer-authenticates over the socket.
 * See "Running the generator" in doc/seo-prerender.md for a run from anywhere
 * else.
 */
const pool = new pg.Pool({
  // node-postgres takes TCP localhost where libpq takes the socket; following
  // psql is what lets an fm5 run need no environment at all.
  host: process.env['PGHOST'] ?? '/var/run/postgresql',
  database: process.env['PGDATABASE'] ?? 'osm',
  user: process.env['PGUSER'] ?? 'freemap',
  max: 1,
  // A country-wide category is seconds of index and geometry work.
  statement_timeout: 300_000,
});

export type OsmElementType = 'node' | 'way' | 'relation';

const typeCode = { node: 'N', way: 'W', relation: 'R' } as const;

const typeName = { N: 'node', W: 'way', R: 'relation' } as const;

/** What a category matches, in terms of the indexed `kv` column. */
export interface OsmFilter {
  /** All must be present: a bare `key`, or `key=value` (values lowercased). */
  all?: string[];
  /** At least one must be present. */
  any?: string[];
  /**
   * Keys that must exist, rechecked against `tags` rather than looked up in
   * `kv`: `name` is on most of Europe, so it narrows an index scan by nothing.
   */
  has?: string[];
  type?: OsmElementType;
}

export interface OsmRef {
  type: OsmElementType;
  id: number;
}

export interface OsmFeature extends OsmRef {
  tags: Record<string, string>;
  /** ST_PointOnSurface: on the object itself, where a bbox centre can miss it. */
  center: { lat: number; lon: number };
}

/** A country's boundary relation, with the Web Mercator bounds of its geometry. */
export interface OsmArea {
  relationId: number;
  bbox: [number, number, number, number];
}

export async function fetchArea(relationId: number): Promise<OsmArea> {
  const { rows } = await pool.query<{
    xmin: number | null;
    ymin: number;
    xmax: number;
    ymax: number;
  }>(
    `SELECT ST_XMin(e) AS xmin, ST_YMin(e) AS ymin,
            ST_XMax(e) AS xmax, ST_YMax(e) AS ymax
     FROM (
       SELECT ST_Envelope(geom) AS e
       FROM osm_object WHERE osm_type = 'R' AND osm_id = $1
     ) AS s`,
    [relationId],
  );

  const row = rows[0];

  // A missing row and an empty geometry both have to fail here: NULL bounds
  // make every later `&&` NULL, and the run then writes an empty sitemap that
  // deploys over the live one.
  if (!row || row.xmin === null) {
    throw new Error(
      `no usable boundary relation ${relationId} in the OSM database`,
    );
  }

  return { relationId, bbox: [row.xmin, row.ymin, row.xmax, row.ymax] };
}

/**
 * Every element of `area` the filter matches, as bare references. Ids first and
 * tags in batches afterwards, so a country's worth of tags never has to fit in
 * memory at once.
 */
export async function fetchRefs(
  area: OsmArea,
  filter: OsmFilter,
): Promise<OsmRef[]> {
  const values: unknown[] = [area.relationId, ...area.bbox];

  const add = (value: unknown) => `$${values.push(value)}`;

  // The envelope has to be a separate condition from ST_Intersects below, or
  // the planner takes the geometry index alone and never ANDs in `kv`.
  const conditions = ['o.geom && ST_MakeEnvelope($2, $3, $4, $5, 3857)'];

  if (filter.type) {
    conditions.push(`o.osm_type = ${add(typeCode[filter.type])}::char(1)`);
  }

  if (filter.all?.length) {
    conditions.push(`o.kv @> ${add(filter.all)}::text[]`);
  }

  if (filter.any?.length) {
    conditions.push(`o.kv && ${add(filter.any)}::text[]`);
  }

  for (const key of filter.has ?? []) {
    conditions.push(`jsonb_exists(o.tags, ${add(key)})`);
  }

  // Last, so the exact tests only run on what the indexes have left. Touching
  // is not being in: neighbouring polygons share the border line, and without
  // the second test Slovakia collects ~400 foreign municipalities.
  conditions.push('ST_Intersects(o.geom, (SELECT geom FROM area))');
  conditions.push('NOT ST_Touches(o.geom, (SELECT geom FROM area))');

  const { rows } = await pool.query<{
    osm_type: keyof typeof typeName;
    osm_id: string;
  }>(
    `WITH area AS MATERIALIZED (
       SELECT geom FROM osm_object WHERE osm_type = 'R' AND osm_id = $1
     )
     SELECT o.osm_type, o.osm_id
     FROM osm_object o
     WHERE ${conditions.join('\n       AND ')}
     ORDER BY o.osm_type, o.osm_id`,
    values,
  );

  return rows.map((row) => ({
    type: typeName[row.osm_type],
    id: Number(row.osm_id),
  }));
}

/** Tags and label point for each reference, in the order given. */
export async function* streamFeatures(
  refs: readonly OsmRef[],
  batchSize = 1000,
): AsyncGenerator<OsmFeature> {
  for (let i = 0; i < refs.length; i += batchSize) {
    const batch = refs.slice(i, i + batchSize);

    const { rows } = await pool.query<{
      osm_type: keyof typeof typeName;
      osm_id: string;
      tags: Record<string, string>;
      lat: number | null;
      lon: number | null;
    }>(
      `SELECT o.osm_type, o.osm_id, o.tags,
              round(ST_Y(p.pt)::numeric, 7)::float8 AS lat,
              round(ST_X(p.pt)::numeric, 7)::float8 AS lon
       FROM unnest($1::text[], $2::bigint[]) WITH ORDINALITY AS k(t, i, ord)
       JOIN osm_object o ON o.osm_type = k.t::char(1) AND o.osm_id = k.i
       CROSS JOIN LATERAL (SELECT ST_Transform(fm_point(o.geom), 4326) AS pt) AS p
       ORDER BY k.ord`,
      [batch.map((ref) => typeCode[ref.type]), batch.map((ref) => ref.id)],
    );

    for (const row of rows) {
      if (row.lat === null || row.lon === null) {
        console.warn(
          `  skipping ${typeName[row.osm_type]}/${row.osm_id}: empty geometry, no label point`,
        );

        continue;
      }

      yield {
        type: typeName[row.osm_type],
        id: Number(row.osm_id),
        tags: row.tags,
        center: { lat: row.lat, lon: row.lon },
      };
    }
  }
}

export function closeOsmDb(): Promise<void> {
  return pool.end();
}
