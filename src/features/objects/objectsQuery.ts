import {
  OverpassCenterExtraSchema,
  overpassResultSchema,
} from '@shared/types/overpass.js';
import type { ObjectsResult } from './model/actions.js';

export const OverpassResultCenterSchema = overpassResultSchema(
  OverpassCenterExtraSchema,
);

export type ObjectsBounds = {
  south: number;
  west: number;
  north: number;
  east: number;
};

/**
 * The Overpass query behind the objects tool: one `nwr` per active category,
 * each a comma-joined set of `key=value` pairs (a leading `!` on the key means
 * "without this tag", a missing value means "with any").
 */
export function buildObjectsQuery(
  active: string[],
  { south, west, north, east }: ObjectsBounds,
  limit: number,
): string {
  const ents = active.map((tags) =>
    tags.split(',').map((item) => item.split('=')),
  );

  return (
    '[out:json][timeout:15]; (' +
    ents
      .map(
        (ent) =>
          'nwr' +
          ent
            .map(([key, value]) =>
              key.startsWith('!')
                ? `[!"${key.slice(1)}"]`
                : value
                  ? `["${key}"~"(^|;\\s*)${value}(\\s*;|$)",i]`
                  : `["${key}"]`,
            )
            .join('') +
          `(${south},${west},${north},${east})` +
          ';',
      )
      .join('') +
    `); out center ${limit};`
  );
}

/** The elements of an Overpass answer, as the objects tool holds them. */
export function parseObjectsResult(json: unknown): ObjectsResult[] {
  return OverpassResultCenterSchema.parse(json)
    .elements.filter((e) => e.tags)
    .map(
      (e) =>
        ({
          id: { type: 'osm', elementType: e.type, id: e.id },
          coords:
            e.type === 'node'
              ? { lat: e.lat, lon: e.lon }
              : { lat: e.center.lat, lon: e.center.lon },
          tags: e.tags ?? {},
        }) satisfies ObjectsResult,
    );
}
