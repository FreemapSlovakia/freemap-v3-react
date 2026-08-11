import {
  type AttributionDef,
  GEDTM30_ATTR,
  OUTDOOR_NATIONAL_DTM_ATTRIBUTION,
} from './mapDefinitions.js';

/**
 * Countries the elevation API answers from a national high-resolution terrain
 * model, for a read that presents premium credentials; past their borders such a
 * read falls back to the global 30 m GEDTM30. This is what the premium offer
 * advertises, so it must track the models the API actually holds.
 *
 * A non-premium read gets none of these: it is answered from SRTM everywhere.
 *
 * Drawn from the outdoor renderer's shading sources
 * (`OUTDOOR_NATIONAL_DTM_ATTRIBUTION` in `mapDefinitions.tsx`) — the same
 * models, and at the moment the same countries, but the two lists stay separate
 * because either side can gain a model the other doesn't hold.
 */
export const ELEVATION_API_DTM_COUNTRIES = [
  'at',
  'ch',
  'cz',
  'es',
  'fi',
  'fr',
  'hr',
  'it',
  'no',
  'pl',
  'se',
  'si',
  'sk',
];

/**
 * The national models above as attribution entries, so a profile read from the
 * elevation API can credit the same sources the outdoor map credits.
 */
export const ELEVATION_API_DTM_ATTRIBUTION =
  OUTDOOR_NATIONAL_DTM_ATTRIBUTION.filter((attr) =>
    ELEVATION_API_DTM_COUNTRIES.includes(attr.country),
  );

/**
 * The near-global model behind two unrelated things: what the elevation API
 * answers a non-premium read with, and what GraphHopper serves its own elevation
 * from (`graph.elevation.provider: srtm`), which a route's profile keeps on the
 * free tier. Being one dataset, it is credited once either way.
 */
export const SRTM_ATTR: AttributionDef = {
  type: 'data',
  name: 'SRTM',
  url: 'https://www.earthdata.nasa.gov/data/instruments/srtm',
};

/** The token for GraphHopper's own elevation, which is the same SRTM data. */
export const SRTM_TOKEN = 'srtm';

/**
 * The models the elevation API falls back to outside the national ones, by the
 * token it reports them under — the sources that aren't scoped to a country, so
 * they can't be named by a country code. GEDTM30 answers a premium read past the
 * national borders, SRTM answers a non-premium one everywhere.
 */
const GLOBAL_MODELS: Record<string, AttributionDef> = {
  gedtm30: GEDTM30_ATTR,
  [SRTM_TOKEN]: SRTM_ATTR,
};

/**
 * A token naming a country's model rather than a model of its own. Anything else
 * is credited under the token itself — `Intl.DisplayNames` throws on a region
 * code that is neither two letters nor three digits, and we accept only the
 * former.
 */
const COUNTRY_TOKEN = /^[a-z]{2}$/;

/**
 * Resolves the source tokens the elevation API reports (`?sources=1`) to the
 * attribution entries to credit, ordered as the map's own attribution orders
 * them: the national models first, the global ones last. Duplicates collapse, so
 * a source reported twice — or SRTM arriving both from the router and from the
 * API — is credited once.
 *
 * A token is an ISO 3166-1 alpha-2 country code (that country's national model)
 * or a model id for one that isn't country-scoped (see {@link GLOBAL_MODELS}).
 * An unrecognised country still gets credited — under its localized name, via
 * `regionName`, since a model the API gained is one we have no link for yet, and
 * dropping it silently would under-credit it. Only a token that really is two
 * letters is offered to `regionName`, which rejects anything else.
 *
 * Case is normalized, so the contract's lowercase is what it reads best as
 * rather than something a stray `SK` breaks on.
 */
export function elevationSourcesFromTokens(
  tokens: string[],
  regionName: (country: string) => string | undefined,
): AttributionDef[] {
  const unique = [...new Set(tokens.map((token) => token.toLowerCase()))];

  const national = unique.filter((token) => !GLOBAL_MODELS[token]);

  const credited = ELEVATION_API_DTM_ATTRIBUTION.filter((attr) =>
    national.includes(attr.country),
  );

  return [
    // Known models in the table's own order, so the list doesn't reshuffle as
    // the reported set changes; anything new to us after them.
    ...credited,
    ...national
      .filter((token) => !credited.some((attr) => attr.country === token))
      .map(
        (token): AttributionDef => ({
          type: 'data',
          ...(COUNTRY_TOKEN.test(token)
            ? { country: token, name: regionName(token) ?? token }
            : { name: token }),
        }),
      ),
    // In the registry's order, not the report's, for the same reason.
    ...Object.entries(GLOBAL_MODELS)
      .filter(([token]) => unique.includes(token))
      .map(([, attr]) => attr),
  ];
}

// Nothing derives the sources from where the map is looking: the API reports
// what answered for the very points it was asked about, and a viewport is only a
// proxy for those — one that over-credits a zoomed-out view, and that would keep
// a copy of the API's own model choice here to rot. With nothing reported the
// honest answer is to credit nothing.
