import {
  type AttributionDef,
  OUTDOOR_NATIONAL_DTM_ATTRIBUTION,
} from './mapDefinitions.js';

/**
 * Countries the elevation API answers from a national high-resolution terrain
 * model, for a read that presents premium credentials; past their borders such a
 * read falls back to the global 30 m GEDTM30. This is what the premium offer
 * advertises, so it must track the models the API actually holds.
 *
 * A non-premium read gets none of these: it is answered from SRTM everywhere.
 * Neither is what GraphHopper returns from its own graph — that is Sonny's.
 *
 * Drawn from the outdoor renderer's shading sources
 * (`OUTDOOR_NATIONAL_DTM_ATTRIBUTION` in `mapDefinitions.tsx`) — the same
 * models, and at the moment the same countries, but the two lists stay separate
 * because either side can gain a model the other doesn't hold.
 *
 * Coverage is per country, so `gb` overstates a model that covers England
 * alone; a read elsewhere in the UK still falls back to GEDTM30. A country can
 * also have more than one model — `be` is two — so this list is the countries,
 * not the models.
 */
export const ELEVATION_API_DTM_COUNTRIES = [
  'at',
  'be',
  'ch',
  'cz',
  'es',
  'fi',
  'fr',
  'gb',
  'hr',
  'it',
  'lu',
  'no',
  'pl',
  'se',
  'si',
  'sk',
];

/**
 * The national models above as attribution entries — what the panorama's footer
 * credits, the terrain service naming no model itself. An elevation read credits
 * what the API resolved for it instead (`readElevationAttributions`).
 */
export const ELEVATION_API_DTM_ATTRIBUTION =
  OUTDOOR_NATIONAL_DTM_ATTRIBUTION.filter((attr) =>
    ELEVATION_API_DTM_COUNTRIES.includes(attr.country),
  );

/**
 * The LiDAR-derived terrain model GraphHopper is built on: it serves its own
 * elevation from it, which a route's profile keeps on the free tier, and weighs
 * every route by it — so a premium route, whose profile is re-read from the
 * national models, is still shaped by this one. Its open licence asks to be
 * credited, which is why a standing GraphHopper result names it as well.
 */
export const SONNY_ATTR: AttributionDef = {
  type: 'data',
  name: "Sonny's LiDAR DTM",
  url: 'https://sonny.4lima.de/',
};

/** A token naming a country's national model rather than a model of its own. */
const COUNTRY_TOKEN = /^[a-z]{2}$/;

/**
 * Whether every model that answered is a national one — LiDAR-derived, so a
 * reading off it is worth a decimal. Recognized by the country code it is
 * reported under, since a global model the API gains is named by a model id we
 * would not know: the decimal is then withheld rather than claimed off a 30 m
 * grid. Nothing reported is treated the same way.
 */
export function hasSubMeterPrecision(tokens: string[]): boolean {
  return (
    tokens.length > 0 &&
    tokens.every((token) => COUNTRY_TOKEN.test(token.toLowerCase()))
  );
}

// Nothing derives the sources from where the map is looking: the API reports
// what answered for the very points it was asked about, and a viewport is only a
// proxy for those — one that over-credits a zoomed-out view, and that would keep
// a copy of the API's own model choice here to rot. With nothing reported the
// honest answer is to credit nothing.
