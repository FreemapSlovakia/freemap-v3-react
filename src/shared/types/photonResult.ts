import type { BBox } from 'geojson';
import z from 'zod';
import { GeoJSONPointSchema } from 'zod-geojson';

/**
 * Languages the geocoder was imported with (photon's `-languages`). Photon
 * answers `400` for a language outside this set rather than falling back, so a
 * UI locale that is not here has to ask for `default` instead — see
 * `doc/photon-geocoder.md`. Widening the set means re-importing the index.
 */
const photonLanguages = new Set([
  'sk',
  'cs',
  'en',
  'de',
  'fr',
  'it',
  'hu',
  'pl',
  'sl',
  'hr',
  'sr',
  'uk',
  'ro',
  'nl',
  'es',
  'pt',
]);

/** The language to ask Photon for, or `default` if it has none of its own. */
export function photonLang(language: string): string {
  return photonLanguages.has(language) ? language : 'default';
}

const osmElementTypes = {
  N: 'node',
  W: 'way',
  R: 'relation',
} as const;

export function photonOsmElementType(
  osmType: keyof typeof osmElementTypes,
): (typeof osmElementTypes)[keyof typeof osmElementTypes] {
  return osmElementTypes[osmType];
}

/**
 * Loose, because Photon carries a different set of address parts per result and
 * gains new ones between versions; what we don't read passes through untouched.
 */
export const PhotonPropertiesSchema = z.looseObject({
  osm_type: z.enum(['N', 'W', 'R']).optional(),
  osm_id: z.number().optional(),
  // The OSM tag the hit was indexed under — `class`/`type` as Nominatim named
  // them, and what the icon and generic-name resolvers key off.
  osm_key: z.string().optional(),
  osm_value: z.string().optional(),
  name: z.string().nullish(),
  housenumber: z.string().nullish(),
  street: z.string().nullish(),
  locality: z.string().nullish(),
  district: z.string().nullish(),
  city: z.string().nullish(),
  county: z.string().nullish(),
  state: z.string().nullish(),
  postcode: z.string().nullish(),
  country: z.string().nullish(),
  countrycode: z.string().nullish(),
  /** `[west, north, east, south]` — not the GeoJSON bbox order. */
  extent: z.tuple([z.number(), z.number(), z.number(), z.number()]).optional(),
});

export type PhotonProperties = z.infer<typeof PhotonPropertiesSchema>;

/**
 * Photon indexes a feature under its most specific tag and drops the parent it
 * hangs off in OSM: a guidepost arrives as `information=guidepost`, never as
 * `tourism=information` + `information=guidepost`. The name and icon mappings
 * are keyed the way OSM tags an element, so the parent is put back here rather
 * than teaching those mappings a second shape — they are shared with Overpass,
 * where the tags always arrive whole.
 */
const parentTags: Record<string, [key: string, value: string]> = {
  information: ['tourism', 'information'],
  water: ['natural', 'water'],
};

/** The hit's OSM tags, as an element carrying them would have them. */
export function photonOsmTags(
  properties: PhotonProperties,
): Record<string, string> {
  const tags: Record<string, string> = {};

  const { osm_key: key, osm_value: value } = properties;

  // Only tags that carry a value: every consumer reads a value as a string, and
  // Photon leaves out the name of anything that has none (an address, most of
  // all).
  if (key !== undefined && value !== undefined) {
    const parent = parentTags[key];

    if (parent) {
      tags[parent[0]] = parent[1];
    }

    tags[key] = value;
  }

  if (properties.name) {
    tags['name'] = properties.name;
  }

  return tags;
}

/** Photon answers with the centroid; an outline comes from OSM on selection. */
export const PhotonFeatureSchema = z.object({
  type: z.literal('Feature'),
  geometry: GeoJSONPointSchema,
  properties: PhotonPropertiesSchema,
});

export type PhotonFeature = z.infer<typeof PhotonFeatureSchema>;

export const PhotonResponseSchema = z.object({
  type: z.literal('FeatureCollection'),
  features: z.array(PhotonFeatureSchema),
});

export function photonExtentToBBox(
  extent: [number, number, number, number],
): BBox {
  return [extent[0], extent[3], extent[2], extent[1]];
}

/**
 * Photon answers with address parts rather than one string, so join them the
 * way Nominatim's `display_name` read. A part that repeats one already taken is
 * dropped — a place and the city it names are the same word.
 */
export function photonDisplayName(properties: PhotonProperties): string {
  return joinParts([properties.name, ...addressParts(properties)]);
}

/**
 * The same chain without the hit's own name, for a list that shows the name on
 * a line of its own.
 */
export function photonAddress(properties: PhotonProperties): string {
  // The name still seeds the dedupe, or a place would be followed by the city
  // it names — which the line above it already says.
  return joinParts(addressParts(properties), properties.name);
}

function addressParts(properties: PhotonProperties) {
  const { street, housenumber } = properties;

  return [
    street && (housenumber ? `${street} ${housenumber}` : street),
    properties.locality,
    properties.district,
    properties.city,
    properties.county,
    properties.state,
    properties.postcode,
    properties.country,
  ];
}

function joinParts(
  parts: (string | null | undefined)[],
  seed?: string | null,
): string {
  const seen = new Set<string>(seed ? [seed] : []);

  return parts
    .filter((part): part is string => {
      if (!part || seen.has(part)) {
        return false;
      }

      seen.add(part);

      return true;
    })
    .join(', ');
}
