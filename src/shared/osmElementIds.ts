import type { OsmFeatureId } from './types/featureId.js';

const elementTypes: Record<string, OsmFeatureId['elementType']> = {
  n: 'node',
  w: 'way',
  r: 'relation',
  node: 'node',
  way: 'way',
  relation: 'relation',
};

/**
 * `n123`, `w/456` — tight and at least three digits, or a road ref (`R2`,
 * `N 118`) would read as an element.
 */
const shortRe = /^([nwr])\/?(\d{3,})$/i;

/** `node/123`, `node 123`, `relation123` — spelled out, any id is meant. */
const longRe = /^(node|way|relation)\s*\/?\s*(\d+)$/i;

/**
 * An element's own page on osm.org, or its history — with the `#map=` the
 * address bar appends.
 */
const urlRe =
  /^\w+:\/\/[^\s/]+\/(node|way|relation)\/(\d+)(?:\/history)?\/?(?:[?#]\S*)?$/i;

/**
 * The OSM element a query names outright — the short `n123`, the spelled-out
 * `node/123`, or a link to the element's page. `null` for everything else,
 * which is then a query for the geocoder.
 */
export function parseOsmElementId(query: string): OsmFeatureId | null {
  const q = query.trim();

  const m = urlRe.exec(q) ?? longRe.exec(q) ?? shortRe.exec(q);

  if (!m) {
    return null;
  }

  const id = Number(m[2]);

  return id < 1
    ? null
    : { type: 'osm', elementType: elementTypes[m[1].toLowerCase()], id };
}
